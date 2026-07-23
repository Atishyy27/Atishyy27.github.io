"use client";

/**
 * The contribution year as a city.
 *
 * Same numbers as the flat grid, extruded: one tower per day, height and
 * colour from that day's total. Drag to orbit. It is the same truth as the
 * heatmap, which is the point — you can read a year of work as a skyline and
 * still hover a single tower to get the exact day back.
 *
 * One InstancedMesh for ~371 towers, so it stays a single draw call.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { buildWeeks, type DayMap } from "@/lib/activity";

const CELL = 1;      // footprint of one day
const GAP = 0.18;    // space between towers
const UNIT = CELL + GAP;

function Towers({
  merged,
  onHover,
}: {
  merged: DayMap;
  onHover: (h: { date: string; count: number } | null) => void;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const { weeks, max } = useMemo(() => buildWeeks(merged), [merged]);
  const flat = useMemo(
    () => weeks.flatMap((w, col) => w.map((cell, row) => ({ ...cell, col, row }))),
    [weeks]
  );

  // grow the towers in on first paint instead of snapping to full height
  const grow = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const cold = useMemo(() => new THREE.Color("#16202b"), []);
  const warm = useMemo(() => new THREE.Color("#3fbdbd"), []);
  const hot = useMemo(() => new THREE.Color("#ff9d5c"), []);

  const cols = weeks.length;

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    grow.current = Math.min(1, grow.current + dt * 0.9);
    const e = 1 - Math.pow(1 - grow.current, 3); // ease-out cubic

    flat.forEach((c, i) => {
      const ratio = max ? c.count / max : 0;
      // sqrt keeps a 200-commit day from dwarfing every ordinary one
      const h = Math.max(0.06, Math.sqrt(ratio) * 6) * e;
      dummy.position.set((c.col - cols / 2) * UNIT, h / 2, (c.row - 3) * UNIT);
      dummy.scale.set(CELL, h, CELL);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      if (ratio <= 0) color.copy(cold);
      else if (ratio < 0.55) color.copy(warm).lerp(cold, 1 - (0.35 + ratio));
      else color.copy(warm).lerp(hot, (ratio - 0.55) / 0.45);
      m.setColorAt(i, color);
    });

    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={mesh}
      args={[null!, null!, flat.length]}
      onPointerMove={(e) => {
        e.stopPropagation();
        const c = flat[e.instanceId ?? -1];
        if (c) onHover({ date: c.date, count: c.count });
      }}
      onPointerOut={() => onHover(null)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.45} metalness={0.15} />
    </instancedMesh>
  );
}

/** Slow idle spin that stops the moment the visitor grabs it. */
function Idle({ enabled }: { enabled: boolean }) {
  const { camera } = useThree();
  useFrame((_, dt) => {
    if (!enabled) return;
    const a = dt * 0.06;
    const x = camera.position.x * Math.cos(a) - camera.position.z * Math.sin(a);
    const z = camera.position.x * Math.sin(a) + camera.position.z * Math.cos(a);
    camera.position.set(x, camera.position.y, z);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function Skyline({ merged }: { merged: DayMap }) {
  const [hover, setHover] = useState<{ date: string; count: number } | null>(null);
  const [idle, setIdle] = useState(true);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div
      className="relative h-[380px] w-full cursor-grab overflow-hidden rounded-xl border border-[var(--line)] bg-[#080b10] active:cursor-grabbing"
      onPointerDown={() => setIdle(false)}
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 26, 38], fov: 38 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#080b10"]} />
        <fog attach="fog" args={["#080b10", 55, 105]} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[18, 30, 14]} intensity={1.5} />
        <directionalLight position={[-20, 12, -10]} intensity={0.5} color="#ff9d5c" />

        <Towers merged={merged} onHover={setHover} />

        {hover && (
          <Html position={[0, 9, 0]} center>
            <div className="graph-label">
              {hover.count} on {hover.date}
              <span>hover a tower</span>
            </div>
          </Html>
        )}

        <Idle enabled={idle && !reduced} />
        <OrbitControls
          enablePan={false}
          minPolarAngle={0.15}
          maxPolarAngle={Math.PI / 2.15}
          minDistance={22}
          maxDistance={70}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      <div className="pointer-events-none absolute bottom-3 left-4 font-mono text-[10px] tracking-[0.2em] text-[var(--fg-muted)]">
        DRAG TO ORBIT · SCROLL TO ZOOM
      </div>
    </div>
  );
}
