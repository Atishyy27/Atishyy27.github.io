"use client";

/**
 * THE CORE ELEMENT.
 *
 * One 3D object for the whole site, and it is made of real data: every
 * repository I have opened a pull request against, as a node on a sphere.
 * Radius is how many of mine were merged there. Colour says whether anything
 * landed at all. Hover gives you the name and the count, clicking takes you to
 * that repository's page.
 *
 * Why a sphere of repos and not a nicer-looking abstract shape: a decorative
 * blob on a portfolio is a liability, because the first question it invites is
 * "what is that?" and the honest answer is "nothing". This answers that
 * question with 58 projects and 172 pull requests, and every node is a link to
 * the evidence. If the data were empty the element would be empty too, which is
 * the correct behaviour.
 *
 * One InstancedMesh for every node, so the whole thing is a single draw call
 * (plus one colour-less hit-target mesh, so small nodes are tappable).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html, PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { oss } from "@/content/oss";

const RADIUS = 7.2;
/** below 28fps counts as a decline; a stable 60 is plenty */
const FPS_BOUNDS = (): [number, number] => [28, 60];

type Node = {
  slug: string;
  full: string;
  merged: number;
  total: number;
  size: number;
  pos: THREE.Vector3;
};

/**
 * Fibonacci lattice. Evenly spaces N points on a sphere without the clustering
 * at the poles that naive lat/long stepping produces.
 */
function lattice(n: number): THREE.Vector3[] {
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / Math.max(n - 1, 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    pts.push(new THREE.Vector3(Math.cos(theta) * r * RADIUS, y * RADIUS, Math.sin(theta) * r * RADIUS));
  }
  return pts;
}

function useNodes(): Node[] {
  return useMemo(() => {
    // Biggest contributions first, so they land near the equator where the
    // lattice puts its densest, most readable band.
    const repos = [...oss.repos].sort((a, b) => b.merged - a.merged || b.prs.length - a.prs.length);
    const pts = lattice(repos.length);
    const maxMerged = Math.max(1, ...repos.map((r) => r.merged));

    return repos.map((r, i) => ({
      slug: r.slug,
      full: r.full,
      merged: r.merged,
      total: r.prs.length,
      // sqrt so one dominant repo does not flatten everything else
      size: 0.16 + 0.42 * Math.sqrt(r.merged / maxMerged),
      pos: pts[i],
    }));
  }, []);
}

/**
 * Touch. OrbitControls sets touch-action:none on the canvas, which turns a
 * 340px-tall canvas into a trap on a phone: a finger that lands on it can
 * never scroll the page. pan-y hands vertical swipes back to the browser and
 * still delivers horizontal drags to the controls, which is the rotation that
 * matters here. Re-asserted per frame because the controls re-connect (and
 * reset it) whenever the event source changes.
 */
function TouchAction() {
  const el = useThree((s) => s.gl.domElement);
  useFrame(() => {
    if (el.style.touchAction !== "pan-y") el.style.touchAction = "pan-y";
  });
  return null;
}

/**
 * Fit the sphere to the canvas. The camera fov is vertical, so on a portrait
 * canvas the horizontal field is narrower than the sphere and its sides were
 * cut off. Landscape keeps the original distance, so desktop is unchanged.
 */
function FitCamera() {
  const camera = useThree((s) => s.camera);
  const width = useThree((s) => s.size.width);
  const height = useThree((s) => s.size.height);
  const controls = useThree((s) => s.controls);
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = width / Math.max(height, 1);
    const tanV = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2);
    let d = Math.hypot(19, 3.5);
    if (aspect < 1) {
      const half = Math.atan(tanV * aspect);
      d = Math.max(d, (RADIUS + 0.5) / Math.sin(half));
    }
    cam.position.setLength(d);
    cam.updateProjectionMatrix();
    (controls as unknown as { update?: () => void } | null)?.update?.();
  }, [camera, width, height, controls]);
  return null;
}

function Nodes({
  nodes,
  active,
  boost,
  showLabel,
  onHover,
  onPick,
}: {
  nodes: Node[];
  active: Node | null;
  boost: number;
  showLabel: boolean;
  onHover: (n: Node | null) => void;
  onPick: (n: Node) => void;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const hit = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);
  const landed = useMemo(() => new THREE.Color("#5eb3b3"), []);
  const pending = useMemo(() => new THREE.Color("#3a4453"), []);

  // Written once. Nothing about position or colour changes after mount, so
  // there is no reason to pay for it every frame.
  const written = useRef(false);
  useFrame((_, dt) => {
    const m = mesh.current;
    const h = hit.current;
    if (!m || !h) return;

    if (!written.current) {
      nodes.forEach((n, i) => {
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(n.size * boost);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        m.setColorAt(i, c.copy(n.merged > 0 ? landed : pending));
        // The invisible hit sphere is what a finger lands on. The smallest
        // visible node is ~6px across on a phone; a fingertip is ~40.
        dummy.scale.setScalar(Math.max(n.size * boost * 1.4, 0.75));
        dummy.updateMatrix();
        h.setMatrixAt(i, dummy.matrix);
      });
      m.instanceMatrix.needsUpdate = true;
      h.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
      written.current = true;
    }

    // Slow drift so the thing reads as an object rather than a screenshot.
    // OrbitControls still takes over the moment anyone touches it.
    if (group.current) group.current.rotation.y += dt * 0.055;
  });

  return (
    <group ref={group}>
      {/* The lattice edges, drawn as a faint wire shell so the nodes read as
          sitting ON something instead of floating in a void. */}
      <mesh>
        <icosahedronGeometry args={[RADIUS, 2]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.045} />
      </mesh>

      <instancedMesh ref={mesh} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial roughness={0.45} metalness={0.15} />
      </instancedMesh>

      {/* Hit targets only: draws nothing (colorWrite off) but takes the pointer
          events, so the smallest nodes are tappable. */}
      <instancedMesh
        ref={hit}
        args={[undefined, undefined, nodes.length]}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          // a finger dragging across the sphere is a rotate, not a hover
          if (e.nativeEvent.pointerType === "touch") return;
          e.stopPropagation();
          const i = e.instanceId;
          if (i === undefined || nodes[i] === active) return;
          onHover(nodes[i]);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e: ThreeEvent<PointerEvent>) => {
          if (e.nativeEvent.pointerType === "touch") return;
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          // a drag that ends over a node is a rotate, not a click
          if (e.delta > 6) return;
          if (e.instanceId !== undefined) onPick(nodes[e.instanceId]);
        }}
      >
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial colorWrite={false} depthWrite={false} />
      </instancedMesh>

      {showLabel && active ? (
        <Html position={active.pos} center distanceFactor={14}>
          <div className="graph-label">
            {active.full}
            <span>
              {active.merged} merged of {active.total}
            </span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

/** The sphere, as text. Shown when WebGL is missing or a small screen cannot
 *  keep it moving: the same repos, the same links, no canvas. */
function RepoList({ nodes, note }: { nodes: Node[]; note: string }) {
  const cls =
    "inline-flex min-h-[40px] items-center gap-2 rounded-full border border-[var(--line)] px-3 text-[length:var(--step-small)] hover:border-[var(--accent)]";
  return (
    <div className="rounded-xl border border-[var(--line)] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--fg-muted)]">{note}</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {nodes
          .filter((n) => n.merged > 0)
          .slice(0, 24)
          .map((n) => {
            const body = (
              <>
                {n.full.split("/")[1]}
                <span className="tabular-nums text-[var(--fg-muted)]">{n.merged}</span>
              </>
            );
            return (
              <li key={n.full}>
                {n.slug ? (
                  <Link href={`/oss/${n.slug}/`} className={cls}>
                    {body}
                  </Link>
                ) : (
                  <a href={`https://github.com/${n.full}`} target="_blank" rel="noopener" className={cls}>
                    {body}
                  </a>
                )}
              </li>
            );
          })}
      </ul>
    </div>
  );
}

export default function CoreScene() {
  const nodes = useNodes();
  const router = useRouter();
  const [hover, setHover] = useState<Node | null>(null);
  // This module only loads in the browser (ssr:false), so window is safe here.
  const [coarse] = useState(() => window.matchMedia("(pointer: coarse)").matches);
  const [small] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const baseDpr = small ? 1.5 : 1.75;
  const [dprMax, setDprMax] = useState(baseDpr);
  const [lite, setLite] = useState(false);
  const [visible, setVisible] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // Stop rendering while the sphere is off screen. On a phone the page is a
  // long scroll, and a spinning WebGL canvas two screens up still burns battery.
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, [lite]);

  // An empty dataset must render as nothing, not as a sphere of zero.
  if (nodes.length === 0) return null;

  const open = (n: Node) =>
    n.slug ? router.push(`/oss/${n.slug}/`) : window.open(`https://github.com/${n.full}`, "_blank", "noopener");

  // No hover on a finger: the first tap names the node, the second opens it.
  const pick = (n: Node) => {
    if (coarse && hover?.full !== n.full) {
      setHover(n);
      return;
    }
    open(n);
  };

  if (lite) {
    return <RepoList nodes={nodes} note="3D view is off on this device, here are the repos as a list" />;
  }

  return (
    <div>
      <div ref={box} className="relative h-[340px] w-full sm:h-[520px]">
        <Canvas
          camera={{ position: [0, 3.5, 19], fov: 42 }}
          dpr={[1, dprMax]}
          frameloop={visible ? "always" : "never"}
          gl={{ antialias: !small, alpha: true, powerPreference: "high-performance" }}
          fallback={<RepoList nodes={nodes} note="WebGL is not available here, here are the repos as a list" />}
          onPointerMissed={() => {
            if (coarse) setHover(null);
          }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[8, 12, 10]} intensity={1.15} />
          <directionalLight position={[-10, -6, -8]} intensity={0.3} color="#c98a5e" />

          {/* Quality follows the frame rate: dpr steps down first, and a small
              screen that still cannot keep up drops to the static list. */}
          <PerformanceMonitor
            factor={0.5}
            bounds={FPS_BOUNDS}
            onChange={({ factor }) => {
              setDprMax(1 + (baseDpr - 1) * Math.min(1, factor * 2));
              if (small && factor <= 0.05) setLite(true);
            }}
          />

          <Nodes
            nodes={nodes}
            active={hover}
            boost={small ? 1.35 : 1}
            showLabel={!coarse}
            onHover={setHover}
            onPick={pick}
          />

          <OrbitControls
            makeDefault
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI - Math.PI / 5}
            rotateSpeed={0.55}
          />
          <FitCamera />
          <TouchAction />
        </Canvas>
      </div>

      {/* Only the hover readout lives here. The standing caption is rendered by
          the page, because this component is client-only: its text would never
          reach the HTML and the facts in it would be invisible without WebGL. */}
      <p aria-live="polite" className="min-h-[2.5rem] text-[length:var(--step-small)] sm:min-h-[1.25rem]">
        {hover ? (
          <span className="text-[var(--fg)]">
            {hover.full} — {hover.merged} merged of {hover.total}.{" "}
            {coarse ? (
              <button type="button" onClick={() => open(hover)} className="min-h-[40px] text-[var(--accent)] underline">
                Open it
              </button>
            ) : (
              "Click to open."
            )}
          </span>
        ) : (
          <span className="text-[var(--fg-muted)]">
            {coarse
              ? "Swipe sideways to turn it, tap a node to read it, tap again to open."
              : "Drag to turn it, click a node to open that project."}
          </span>
        )}
      </p>
    </div>
  );
}
