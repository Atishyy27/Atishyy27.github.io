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
 * One InstancedMesh for every node, so the whole thing is a single draw call.
 */

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { oss } from "@/content/oss";

const RADIUS = 7.2;

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

function Nodes({
  nodes,
  onHover,
  onPick,
}: {
  nodes: Node[];
  onHover: (n: Node | null) => void;
  onPick: (n: Node) => void;
}) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const group = useRef<THREE.Group>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const c = useMemo(() => new THREE.Color(), []);
  const landed = useMemo(() => new THREE.Color("#5eb3b3"), []);
  const pending = useMemo(() => new THREE.Color("#3a4453"), []);
  const [hovered, setHovered] = useState<number | null>(null);

  // Written once. Nothing about position or colour changes after mount, so
  // there is no reason to pay for it every frame.
  const written = useRef(false);
  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;

    if (!written.current) {
      nodes.forEach((n, i) => {
        dummy.position.copy(n.pos);
        dummy.scale.setScalar(n.size);
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);
        m.setColorAt(i, c.copy(n.merged > 0 ? landed : pending));
      });
      m.instanceMatrix.needsUpdate = true;
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

      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, nodes.length]}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const i = e.instanceId;
          if (i === undefined || i === hovered) return;
          setHovered(i);
          onHover(nodes[i]);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(null);
          onHover(null);
          document.body.style.cursor = "";
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          if (e.instanceId !== undefined) onPick(nodes[e.instanceId]);
        }}
      >
        <sphereGeometry args={[1, 18, 18]} />
        <meshStandardMaterial roughness={0.45} metalness={0.15} />
      </instancedMesh>

      {hovered !== null && nodes[hovered] ? (
        <Html position={nodes[hovered].pos} center distanceFactor={14}>
          <div className="graph-label">
            {nodes[hovered].full}
            <span>
              {nodes[hovered].merged} merged of {nodes[hovered].total}
            </span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export default function CoreScene() {
  const nodes = useNodes();
  const router = useRouter();
  const [hover, setHover] = useState<Node | null>(null);

  // An empty dataset must render as nothing, not as a sphere of zero.
  if (nodes.length === 0) return null;

  return (
    <div>
      <div className="relative h-[420px] w-full sm:h-[520px]">
        <Canvas
          camera={{ position: [0, 3.5, 19], fov: 42 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.55} />
          <directionalLight position={[8, 12, 10]} intensity={1.15} />
          <directionalLight position={[-10, -6, -8]} intensity={0.3} color="#c98a5e" />

          <Nodes
            nodes={nodes}
            onHover={setHover}
            onPick={(n) => router.push(`/oss/${n.slug}/`)}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={Math.PI - Math.PI / 5}
            rotateSpeed={0.55}
          />
        </Canvas>
      </div>

      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
          {hover ? (
            <span className="text-[var(--fg)]">
              {hover.full} — {hover.merged} merged of {hover.total}. Click to open.
            </span>
          ) : (
            <>
              {oss.repoCount} repositories I do not own, {oss.totals.prs} pull requests.
              Drag to turn it, click a node to open that project.
            </>
          )}
        </p>
        <p className="font-mono text-[10px] tracking-[0.12em] text-[var(--fg-muted)] uppercase">
          teal = something merged · grey = still open
        </p>
      </div>
    </div>
  );
}
