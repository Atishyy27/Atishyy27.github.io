"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";

/* ==================================================================
   Multi-window scene.

   Open the site in two browser windows side by side and drag them
   around: each window owns a glowing core, and the windows reach for
   each other with light across the gap between them. Windows talk
   through localStorage (same-origin, no server) — one window writes
   its screen position, the others read it and aim.

   Single window: the core sits center-stage with a cursor-reactive
   particle field, so it's never empty.

   Orthographic camera at zoom 1 → 1 world unit = 1 screen pixel, so
   everything is placed in real screen coordinates and lines up 1:1
   across physical windows.
================================================================== */

type Win = { id: string; x: number; y: number; w: number; h: number; hue: number; t: number };

const PREFIX = "folio_win_";
const STALE = 1600; // ms — a window that stops heartbeating is gone
const MAXW = 8;

const worldPos = (w: Win): [number, number] => [w.x + w.w / 2, -(w.y + w.h / 2)];

function useWindowSync() {
  const wins = useRef<Map<string, Win>>(new Map());
  const selfId = useRef<string>("");
  const [count, setCount] = useState(1);

  useEffect(() => {
    // browser runtime — Math.random / Date.now are fine here
    const id = `${Date.now().toString(36)}_${Math.floor(Math.random() * 1e6).toString(36)}`;
    selfId.current = id;
    const hue = 175 + Math.floor(Math.random() * 60) - 30; // teal-ish, varied per window
    const key = PREFIX + id;
    let lastWrite = 0;
    let raf = 0;

    const self = (): Win => ({
      id,
      x: window.screenX ?? window.screenLeft ?? 0,
      y: window.screenY ?? window.screenTop ?? 0,
      w: window.innerWidth,
      h: window.innerHeight,
      hue,
      t: Date.now(),
    });

    const read = () => {
      const now = Date.now();
      const next = new Map<string, Win>();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(PREFIX)) continue;
        try {
          const v: Win = JSON.parse(localStorage.getItem(k)!);
          if (now - v.t < STALE) next.set(v.id, v);
          else localStorage.removeItem(k);
        } catch {
          /* ignore corrupt entry */
        }
      }
      wins.current = next;
      setCount((c) => (c === next.size ? c : Math.max(1, next.size)));
    };

    const loop = () => {
      const t = performance.now();
      if (t - lastWrite > 80) {
        try {
          localStorage.setItem(key, JSON.stringify(self()));
        } catch {
          /* quota / private mode */
        }
        lastWrite = t;
      }
      read();
      raf = requestAnimationFrame(loop);
    };

    const cleanup = () => {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    };

    read();
    raf = requestAnimationFrame(loop);
    window.addEventListener("beforeunload", cleanup);
    return () => {
      cancelAnimationFrame(raf);
      cleanup();
      window.removeEventListener("beforeunload", cleanup);
    };
  }, []);

  return { wins, selfId, count };
}

function hueColor(hue: number, light = 0.55) {
  return new THREE.Color().setHSL((hue % 360) / 360, 0.7, light);
}

/* ---- one window's core: a ring of orbiting shards around a bright center ---- */
function Core({ win, self }: { win: Win; self: boolean }) {
  const grp = useRef<THREE.Group>(null!);
  const target = useRef(new THREE.Vector3(...worldPos(win), 0));
  const col = useMemo(() => hueColor(win.hue), [win.hue]);

  const shards = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        a: (i / 10) * Math.PI * 2,
        r: 46 + (i % 3) * 16,
        s: 0.5 + (i % 4) * 0.25,
      })),
    []
  );

  useFrame((state, delta) => {
    if (!grp.current) return;
    const [wx, wy] = worldPos(win);
    target.current.set(wx, wy, 0);
    grp.current.position.lerp(target.current, 0.18);
    grp.current.rotation.z += delta * (self ? 0.25 : 0.15);
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2 + win.hue) * 0.06;
    grp.current.scale.setScalar(pulse);
  });

  return (
    <group ref={grp}>
      {/* bright center */}
      <mesh>
        <circleGeometry args={[self ? 26 : 20, 48]} />
        <meshBasicMaterial color={col} transparent opacity={0.95} />
      </mesh>
      {/* halo */}
      <mesh>
        <circleGeometry args={[self ? 90 : 70, 48]} />
        <meshBasicMaterial color={col} transparent opacity={0.08} />
      </mesh>
      {/* orbiting shards */}
      {shards.map((s, i) => (
        <mesh key={i} position={[Math.cos(s.a) * s.r, Math.sin(s.a) * s.r, 0]} rotation={[0, 0, s.a]}>
          <planeGeometry args={[10 * s.s, 3]} />
          <meshBasicMaterial color={col} transparent opacity={0.75} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

/* ---- light bridges between every window ---- */
function Bridges({ wins }: { wins: React.RefObject<Map<string, Win>> }) {
  const ref = useRef<THREE.LineSegments>(null!);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(MAXW * MAXW * 2 * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(MAXW * MAXW * 2 * 3), 3));
    return g;
  }, []);

  useFrame(() => {
    const list = Array.from(wins.current?.values() ?? []).slice(0, MAXW);
    const pos = geo.attributes.position.array as Float32Array;
    const col = geo.attributes.color.array as Float32Array;
    let n = 0;
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const [ax, ay] = worldPos(list[i]);
        const [bx, by] = worldPos(list[j]);
        const ca = hueColor(list[i].hue, 0.6);
        const cb = hueColor(list[j].hue, 0.6);
        pos.set([ax, ay, -1, bx, by, -1], n * 6);
        col.set([ca.r, ca.g, ca.b, cb.r, cb.g, cb.b], n * 6);
        n++;
      }
    }
    geo.setDrawRange(0, n * 2);
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  });

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial vertexColors transparent opacity={0.5} />
    </lineSegments>
  );
}

/* ---- cursor-reactive dust, filling whatever window you're in ---- */
function Dust() {
  const ref = useRef<THREE.Points>(null!);
  const { size } = useThree();
  const N = 90;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      p[i * 3] = (Math.random() - 0.5) * size.width;
      p[i * 3 + 1] = (Math.random() - 0.5) * size.height;
      p[i * 3 + 2] = -2;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const p = geo.attributes.position.array as Float32Array;
    const mx = (state.pointer.x * size.width) / 2;
    const my = (state.pointer.y * size.height) / 2;
    for (let i = 0; i < N; i++) {
      const dx = mx - p[i * 3];
      const dy = my - p[i * 3 + 1];
      const d2 = dx * dx + dy * dy;
      const f = Math.min(0.0006, 40 / (d2 + 400));
      p[i * 3] += dx * f + Math.sin(state.clock.elapsedTime + i) * 0.15;
      p[i * 3 + 1] += dy * f + Math.cos(state.clock.elapsedTime + i) * 0.15;
    }
    geo.attributes.position.needsUpdate = true;
    ref.current.position.set(-state.camera.position.x, -state.camera.position.y, 0);
  });

  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial size={2} color="#3fbdbd" transparent opacity={0.5} sizeAttenuation={false} />
    </points>
  );
}

function Rig({ wins, selfId }: { wins: React.RefObject<Map<string, Win>>; selfId: React.RefObject<string> }) {
  const world = useRef<THREE.Group>(null!);
  const [ids, setIds] = useState<string[]>([]);
  const offset = useRef(new THREE.Vector3());

  useFrame(() => {
    const map = wins.current;
    if (!map) return;
    const keys = Array.from(map.keys());
    const joined = keys.join(",");
    setIds((prev) => (prev.join(",") === joined ? prev : keys));

    const me = map.get(selfId.current ?? "");
    if (me && world.current) {
      const [sx, sy] = worldPos(me);
      offset.current.set(-sx, -sy, 0);
      world.current.position.lerp(offset.current, 0.18);
    }
  });

  return (
    <>
      <Dust />
      <group ref={world}>
        <Bridges wins={wins} />
        {ids.map((id) => {
          const w = wins.current?.get(id);
          if (!w) return null;
          return <Core key={id} win={w} self={id === selfId.current} />;
        })}
      </group>
    </>
  );
}

export default function Scene() {
  const [enabled, setEnabled] = useState(false);
  const { wins, selfId, count } = useWindowSync();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const small = window.matchMedia("(max-width: 640px)").matches;
    setEnabled(!reduced && !small);
  }, []);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 -z-10">
      <Canvas orthographic camera={{ position: [0, 0, 100], zoom: 1, near: 0.1, far: 1000 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }}>
        <Suspense fallback={null}>
          <Rig wins={wins} selfId={selfId} />
        </Suspense>
      </Canvas>

      {count > 1 && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-[var(--accent)] bg-[#0b0f16cc] px-4 py-1.5 font-mono text-[10px] tracking-[0.2em] text-[var(--accent)] backdrop-blur">
          {count} WINDOWS CONNECTED · DRAG THEM APART
        </div>
      )}
    </div>
  );
}
