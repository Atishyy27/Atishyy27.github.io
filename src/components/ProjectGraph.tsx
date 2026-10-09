"use client";

/**
 * THE CORE ELEMENT: my projects as a graph you can take apart.
 *
 * 18 nodes, one per project. An edge exists where two projects share a
 * technology, and it is thicker the more they share. Node colour is category,
 * node size is how connected it is. Pick a technology and the graph re-routes:
 * only the projects using it stay lit, and only the edges that exist *because*
 * of it are drawn. 3D by default, flattens to 2D on a toggle.
 *
 * Why a graph and not a nicer-looking abstract object: the interesting claim a
 * portfolio can make is not "here are 18 things", it is "here is how they
 * connect". React is in six of them, Flutter in four, and the government and
 * client work share a spine you cannot see in a list. The graph is the only
 * view where that is visible, and every node is a link to the project page, so
 * nothing here is decoration standing in for evidence.
 *
 * Nothing is authored: nodes, edges and the layout all derive from the stack
 * arrays in site.ts. Edit a stack and the shape changes.
 */

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { nodes, edges, sharedTech, layout, CATEGORY_COLOR, type GraphNode } from "@/content/graph";

const DIM = 0.14; // opacity/intensity for a node the current filter excludes

type View = "3d" | "2d";

function Graph({
  tech,
  view,
  spin,
  onHover,
  onPick,
}: {
  tech: string | null;
  view: View;
  spin: boolean;
  onHover: (n: GraphNode | null) => void;
  onPick: (n: GraphNode) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.InstancedMesh>(null);
  const lines = useRef<THREE.LineSegments>(null);
  const [hovered, setHovered] = useState<number | null>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const col = useMemo(() => new THREE.Color(), []);
  const maxDegree = useMemo(() => Math.max(1, ...nodes.map((n) => n.degree)), []);

  // Which nodes and edges the current filter keeps. An edge survives only if
  // the chosen technology is one of the reasons it exists, which is what makes
  // the graph genuinely re-route rather than just fade.
  const active = useMemo(() => {
    if (!tech) return { nodes: new Set(nodes.map((n) => n.id)), edges: edges.map((_, i) => i) };
    return {
      nodes: new Set(nodes.filter((n) => n.stack.includes(tech)).map((n) => n.id)),
      edges: edges.map((e, i) => (e.via.includes(tech) ? i : -1)).filter((i) => i >= 0),
    };
  }, [tech]);

  // Edge geometry is allocated once at full size and rewritten each frame.
  // 29 edges is 58 vertices; rebuilding a buffer that small is cheaper than
  // tracking which ones changed.
  const edgeGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(edges.length * 6), 3));
    return g;
  }, []);

  // 0 = full 3D, 1 = flat. Lerped so the toggle reads as the same object being
  // pressed flat rather than as two different pictures.
  const flat = useRef(0);

  useFrame((_, dt) => {
    const target = view === "2d" ? 1 : 0;
    flat.current += (target - flat.current) * Math.min(1, dt * 4.5);
    const z = (id: string) => layout[id].z * (1 - flat.current);

    const m = mesh.current;
    if (m) {
      nodes.forEach((n, i) => {
        const p = layout[n.id];
        const on = active.nodes.has(n.id);
        const isHover = hovered === i;
        const base = 0.26 + 0.3 * (n.degree / maxDegree);

        dummy.position.set(p.x, p.y, z(n.id));
        dummy.scale.setScalar(base * (on ? (isHover ? 1.5 : 1) : 0.55));
        dummy.updateMatrix();
        m.setMatrixAt(i, dummy.matrix);

        col.set(CATEGORY_COLOR[n.category]);
        if (!on) col.multiplyScalar(DIM);
        else if (isHover) col.offsetHSL(0, 0, 0.12);
        m.setColorAt(i, col);
      });
      m.instanceMatrix.needsUpdate = true;
      if (m.instanceColor) m.instanceColor.needsUpdate = true;
    }

    const posAttr = edgeGeo.getAttribute("position") as THREE.BufferAttribute;
    const colAttr = edgeGeo.getAttribute("color") as THREE.BufferAttribute;
    edges.forEach((e, i) => {
      const a = layout[e.a];
      const b = layout[e.b];
      const on = active.edges.includes(i);
      // A filtered-out edge collapses to a point rather than being deleted, so
      // the buffer size never changes.
      if (on) {
        posAttr.setXYZ(i * 2, a.x, a.y, z(e.a));
        posAttr.setXYZ(i * 2 + 1, b.x, b.y, z(e.b));
      } else {
        posAttr.setXYZ(i * 2, a.x, a.y, z(e.a));
        posAttr.setXYZ(i * 2 + 1, a.x, a.y, z(e.a));
      }
      const lit = on ? 0.1 + 0.12 * Math.min(e.via.length, 3) : 0;
      colAttr.setXYZ(i * 2, lit, lit * 1.5, lit * 1.5);
      colAttr.setXYZ(i * 2 + 1, lit, lit * 1.5, lit * 1.5);
    });
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;

    if (group.current && spin) group.current.rotation.y += dt * 0.05;
  });

  return (
    <group ref={group}>
      <lineSegments ref={lines} geometry={edgeGeo}>
        <lineBasicMaterial vertexColors transparent opacity={0.9} />
      </lineSegments>

      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, nodes.length]}
        onPointerMove={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          const i = e.instanceId;
          if (i === undefined || i === hovered) return;
          if (!active.nodes.has(nodes[i].id)) return;
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
          const i = e.instanceId;
          if (i !== undefined && active.nodes.has(nodes[i].id)) onPick(nodes[i]);
        }}
      >
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial roughness={0.4} metalness={0.2} flatShading />
      </instancedMesh>

      {hovered !== null && nodes[hovered] ? (
        <Html
          position={[
            layout[nodes[hovered].id].x,
            layout[nodes[hovered].id].y + 0.75,
            layout[nodes[hovered].id].z * (1 - flat.current),
          ]}
          center
          distanceFactor={16}
        >
          <div className="graph-label">
            {nodes[hovered].label}
            <span>
              {nodes[hovered].categoryLabel} · {nodes[hovered].stack.slice(0, 3).join(", ")}
            </span>
          </div>
        </Html>
      ) : null}
    </group>
  );
}

export default function ProjectGraph({ reducedMotion = false }: { reducedMotion?: boolean }) {
  const router = useRouter();
  const [tech, setTech] = useState<string | null>(null);
  const [view, setView] = useState<View>("3d");
  const [hover, setHover] = useState<GraphNode | null>(null);

  const litCount = tech ? nodes.filter((n) => n.stack.includes(tech)).length : nodes.length;
  const litEdges = tech ? edges.filter((e) => e.via.includes(tech)).length : edges.length;

  return (
    <div>
      {/* Controls above the canvas rather than floating over it, so they are in
          normal tab order and do not sit on top of the thing they change.
          They do NOT survive without JavaScript: this whole component is
          client-only, because it drives a WebGL canvas. That is why the counts
          and the link to /projects/ are rendered by the page instead of here. */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2 border-t border-[var(--line)] pt-4">
        <button
          onClick={() => setTech(null)}
          aria-pressed={tech === null}
          className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition ${
            tech === null
              ? "border-[var(--accent)] text-[var(--accent)]"
              : "border-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
          }`}
        >
          all {nodes.length}
        </button>
        {sharedTech.map((t) => (
          <button
            key={t.name}
            onClick={() => setTech(tech === t.name ? null : t.name)}
            aria-pressed={tech === t.name}
            className={`rounded-full border px-3 py-1 font-mono text-[10px] tracking-[0.1em] transition ${
              tech === t.name
                ? "border-[var(--accent)] text-[var(--accent)]"
                : "border-[var(--line)] text-[var(--fg-muted)] hover:text-[var(--fg)]"
            }`}
          >
            {t.name} {t.count}
          </button>
        ))}

        <div className="ml-auto inline-flex rounded-full border border-[var(--line)] p-0.5">
          {(["3d", "2d"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.1em] transition ${
                view === v ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--fg-muted)]"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="relative h-[440px] w-full sm:h-[560px]">
        <Canvas camera={{ position: [0, 2, 21], fov: 40 }} dpr={[1, 1.75]} gl={{ antialias: true, alpha: true }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[9, 13, 11]} intensity={1.1} />
          <directionalLight position={[-11, -7, -9]} intensity={0.35} color="#c98a5e" />

          <Graph
            tech={tech}
            view={view}
            spin={!reducedMotion && view === "3d"}
            onHover={setHover}
            onPick={(n) => router.push(`/projects/${n.id}/`)}
          />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI - Math.PI / 6}
            rotateSpeed={0.5}
          />
        </Canvas>
      </div>

      <p aria-live="polite" className="min-h-[1.25rem] text-[length:var(--step-small)]">
        {hover ? (
          <span className="text-[var(--fg)]">
            {hover.label} — {hover.categoryLabel}, {hover.stack.join(", ")}. Click to open.
          </span>
        ) : (
          <span className="text-[var(--fg-muted)]">
            {tech
              ? `${tech}: ${litCount} projects, ${litEdges} connections. Drag to turn, click a node to open it.`
              : "Drag to turn, pick a technology to re-route it, click a node to open that project."}
          </span>
        )}
      </p>
    </div>
  );
}
