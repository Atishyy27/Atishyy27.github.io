"use client";

/**
 * A 3D keyboard that your real keyboard presses.
 *
 * Every keycap is a box. A keydown anywhere on the page depresses the matching
 * cap and lights it; keyup releases it. So this is not a picture of a keyboard,
 * it is an input display: type and it types.
 *
 * Why it exists, given that a decorative 3D object on a portfolio is a
 * liability: the site has real keyboard shortcuts, and nothing on the page says
 * so. The caps that do something here are marked, which makes the object an
 * explanation of a feature rather than an ornament. Pressing the marked ones
 * does the thing.
 *
 * 61 caps in one InstancedMesh, so the whole keyboard is a single draw call.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

/** Physical layout. Width is in key units; 1u is a normal letter key. */
const ROWS: { keys: [string, string, number?][]; }[] = [
  {
    keys: [
      ["`", "Backquote"], ["1", "Digit1"], ["2", "Digit2"], ["3", "Digit3"], ["4", "Digit4"],
      ["5", "Digit5"], ["6", "Digit6"], ["7", "Digit7"], ["8", "Digit8"], ["9", "Digit9"],
      ["0", "Digit0"], ["-", "Minus"], ["=", "Equal"], ["delete", "Backspace", 2],
    ],
  },
  {
    keys: [
      ["tab", "Tab", 1.5], ["Q", "KeyQ"], ["W", "KeyW"], ["E", "KeyE"], ["R", "KeyR"],
      ["T", "KeyT"], ["Y", "KeyY"], ["U", "KeyU"], ["I", "KeyI"], ["O", "KeyO"],
      ["P", "KeyP"], ["[", "BracketLeft"], ["]", "BracketRight"], ["\\", "Backslash", 1.5],
    ],
  },
  {
    keys: [
      ["caps", "CapsLock", 1.75], ["A", "KeyA"], ["S", "KeyS"], ["D", "KeyD"], ["F", "KeyF"],
      ["G", "KeyG"], ["H", "KeyH"], ["J", "KeyJ"], ["K", "KeyK"], ["L", "KeyL"],
      [";", "Semicolon"], ["'", "Quote"], ["return", "Enter", 2.25],
    ],
  },
  {
    keys: [
      ["shift", "ShiftLeft", 2.25], ["Z", "KeyZ"], ["X", "KeyX"], ["C", "KeyC"], ["V", "KeyV"],
      ["B", "KeyB"], ["N", "KeyN"], ["M", "KeyM"], [",", "Comma"], [".", "Period"],
      ["/", "Slash"], ["shift", "ShiftRight", 2.75],
    ],
  },
  {
    keys: [
      ["fn", "Fn"], ["ctrl", "ControlLeft", 1.25], ["opt", "AltLeft", 1.25],
      ["cmd", "MetaLeft", 1.5], ["", "Space", 6.25], ["cmd", "MetaRight", 1.5],
      ["opt", "AltRight", 1.25], ["←", "ArrowLeft"], ["↓", "ArrowDown"], ["→", "ArrowRight"],
    ],
  },
];

/**
 * Caps that actually do something on this site. The labels come from the real
 * handlers: Palette.tsx listens for meta/ctrl + K, and Escape closes it.
 */
const BOUND: Record<string, string> = {
  MetaLeft: "command palette",
  MetaRight: "command palette",
  ControlLeft: "command palette",
  KeyK: "command palette",
  Escape: "close the palette",
};

const UNIT = 1;
const GAP = 0.12;
const DEPTH = 0.42;

type Cap = {
  code: string;
  label: string;
  x: number;
  z: number;
  w: number;
  bound: boolean;
};

function buildCaps(): Cap[] {
  const caps: Cap[] = [];
  ROWS.forEach((row, r) => {
    let x = 0;
    for (const [label, code, width] of row.keys) {
      const w = (width ?? 1) * UNIT;
      caps.push({
        code,
        label,
        x: x + w / 2,
        z: r * (UNIT + GAP),
        w,
        bound: code in BOUND,
      });
      x += w + GAP;
    }
  });

  // Centre the whole board on the origin so the camera framing is stable.
  const maxX = Math.max(...caps.map((c) => c.x + c.w / 2));
  const maxZ = Math.max(...caps.map((c) => c.z));
  for (const c of caps) {
    c.x -= maxX / 2;
    c.z -= maxZ / 2;
  }
  return caps;
}

function Board({
  caps,
  pressed,
  onHover,
  onTap,
  spin,
}: {
  caps: Cap[];
  pressed: Set<string>;
  onHover: (c: Cap | null) => void;
  onTap: (c: Cap) => void;
  spin: boolean;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const [hovered, setHovered] = useState<number | null>(null);

  // Per-cap depression, lerped so a keypress reads as a press rather than a
  // teleport. Held in a ref because this changes every frame and must not
  // trigger React renders.
  const depth = useRef<number[]>(caps.map(() => 0));

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;

    caps.forEach((c, i) => {
      const target = pressed.has(c.code) || hovered === i ? 1 : 0;
      depth.current[i] += (target - depth.current[i]) * Math.min(1, dt * 18);
      const d = depth.current[i];

      dummy.position.set(c.x, DEPTH / 2 - d * 0.22, c.z);
      dummy.scale.set(c.w - GAP, DEPTH, UNIT - GAP);
      dummy.updateMatrix();
      m.setMatrixAt(i, dummy.matrix);

      // Bound keys are tinted; a press brightens whatever the cap already is.
      if (c.bound) col.set("#5eb3b3");
      else col.set("#1b1b1f");
      if (d > 0.01) col.lerp(new THREE.Color("#c98a5e"), d * 0.85);
      m.setColorAt(i, col);
    });

    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;

    if (group.current && spin) {
      // Barely moves. It is a keyboard, not a carousel.
      group.current.rotation.y = Math.sin(performance.now() / 6000) * 0.12;
    }
  });

  return (
    <group ref={group} rotation={[0.1, 0, 0]}>
      {/* The case the caps sit in, so they do not float. */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry
          args={[
            Math.max(...caps.map((c) => c.x + c.w / 2)) * 2 + 0.8,
            0.3,
            Math.max(...caps.map((c) => c.z)) * 2 + UNIT + 0.8,
          ]}
        />
        <meshStandardMaterial color="#0e0e11" roughness={0.75} metalness={0.25} />
      </mesh>

      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, caps.length]}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const i = e.instanceId;
          if (i === undefined || i === hovered) return;
          setHovered(i);
          onHover(caps[i]);
        }}
        onPointerOut={() => {
          setHovered(null);
          onHover(null);
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) onTap(caps[e.instanceId]);
        }}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.55} metalness={0.1} />
      </instancedMesh>

      {/* Labels. Rendered as DOM rather than 3D text so there is no font to
          load and they stay crisp at any zoom. */}
      {caps.map((c) =>
        c.label ? (
          <Html
            key={c.code}
            position={[c.x, DEPTH + 0.02, c.z]}
            center
            distanceFactor={13}
            style={{ pointerEvents: "none" }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: c.label.length > 2 ? 9 : 13,
                color: c.bound ? "#0a0a0b" : "#8c8c92",
                fontWeight: c.bound ? 600 : 400,
                whiteSpace: "nowrap",
              }}
            >
              {c.label}
            </span>
          </Html>
        ) : null
      )}
    </group>
  );
}

export default function Keyboard3D({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const caps = useMemo(buildCaps, []);
  const [pressed, setPressed] = useState<Set<string>>(new Set());
  const [hover, setHover] = useState<Cap | null>(null);
  const [typed, setTyped] = useState("");

  const press = useCallback((code: string) => {
    setPressed((prev) => new Set(prev).add(code));
  }, []);
  const release = useCallback((code: string) => {
    setPressed((prev) => {
      const next = new Set(prev);
      next.delete(code);
      return next;
    });
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      press(e.code);
      // Echo printable characters so there is proof it is reading the real
      // keyboard and not animating on a timer.
      if (e.key.length === 1) setTyped((t) => (t + e.key).slice(-28));
      else if (e.code === "Backspace") setTyped((t) => t.slice(0, -1));
      else if (e.code === "Space") setTyped((t) => (t + " ").slice(-28));
    };
    const up = (e: KeyboardEvent) => release(e.code);

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    // A window that loses focus never delivers keyup, so keys would stick down.
    const blur = () => setPressed(new Set());
    window.addEventListener("blur", blur);

    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [press, release]);

  return (
    <div>
      <div className="relative h-[320px] w-full sm:h-[400px]">
        <Canvas camera={{ position: [0, 9.5, 11] }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.75} />
          <directionalLight position={[6, 14, 8]} intensity={1.2} />
          <directionalLight position={[-8, 6, -6]} intensity={0.4} color="#5eb3b3" />
          <Board
            caps={caps}
            pressed={pressed}
            onHover={setHover}
            onTap={(c) => {
              // A tap has no keyup to wait for, so release it on a timer.
              press(c.code);
              setTimeout(() => release(c.code), 140);
            }}
            spin={!reducedMotion}
          />
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={0.2}
            maxPolarAngle={Math.PI / 2.2}
            rotateSpeed={0.4}
          />
        </Canvas>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p aria-live="polite" className="min-h-[1.25rem] text-[length:var(--step-small)]">
          {hover ? (
            <span className="text-[var(--fg)]">
              {hover.label || "space"}
              {BOUND[hover.code] ? ` — ${BOUND[hover.code]}` : ""}
            </span>
          ) : typed ? (
            <span className="font-mono text-[var(--accent)]">{typed}</span>
          ) : (
            <span className="text-[var(--fg-muted)]">
              Type anything. The caps that are lit do something on this site.
            </span>
          )}
        </p>
        <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
          {caps.length} caps · one draw call
        </p>
      </div>
    </div>
  );
}
