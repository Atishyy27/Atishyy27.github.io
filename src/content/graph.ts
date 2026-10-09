// src/content/graph.ts
// The project graph: 18 nodes, edges where two projects share a technology.
//
// Derived from allProjects, which is itself derived from site.ts. Nothing here
// is authored, so a graph edge is never a claim about my work that the project
// list does not already make. Edit a stack in site.ts and the graph changes.

import { allProjects, CATEGORY_LABEL, type Project } from "./projects";

export type GraphNode = {
  id: string;            // slug
  label: string;
  category: Project["category"];
  categoryLabel: string;
  stack: string[];
  /** Degree, used for node size. A project sharing nothing is still a node. */
  degree: number;
  project: Project;
};

export type GraphEdge = {
  a: string;
  b: string;
  /** Every technology these two share. The edge exists because of these. */
  via: string[];
};

/** Technologies appearing in more than one project, most common first. */
export const sharedTech: { name: string; count: number }[] = (() => {
  const c = new Map<string, number>();
  for (const p of allProjects) for (const s of p.stack) c.set(s, (c.get(s) ?? 0) + 1);
  return [...c.entries()]
    .filter(([, n]) => n > 1)
    .sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
    .map(([name, count]) => ({ name, count }));
})();

export const edges: GraphEdge[] = (() => {
  const out: GraphEdge[] = [];
  for (let i = 0; i < allProjects.length; i++) {
    for (let j = i + 1; j < allProjects.length; j++) {
      const a = allProjects[i];
      const b = allProjects[j];
      const via = a.stack.filter((s) => b.stack.includes(s));
      if (via.length > 0) out.push({ a: a.slug, b: b.slug, via });
    }
  }
  return out;
})();

export const nodes: GraphNode[] = allProjects.map((p) => ({
  id: p.slug,
  label: p.name,
  category: p.category,
  categoryLabel: CATEGORY_LABEL[p.category],
  stack: p.stack,
  degree: edges.filter((e) => e.a === p.slug || e.b === p.slug).length,
  project: p,
}));

/** Colour per category, so the graph reads as grouped without needing a legend. */
export const CATEGORY_COLOR: Record<Project["category"], string> = {
  government: "#5eb3b3",
  client: "#c98a5e",
  institution: "#7c9cff",
  extension: "#8fcf6b",
  hackathon: "#d98ab8",
};

/**
 * Force-directed layout, run once at module load.
 *
 * 18 nodes and ~40 edges, so a plain O(n^2) repulsion loop for 400 steps costs
 * well under a millisecond and there is no reason to pull in a layout library
 * or to animate the simulation on screen. Deterministic seed, so the graph
 * looks the same on every visit and in every build.
 */
export type Point = { x: number; y: number; z: number };

export const layout: Record<string, Point> = (() => {
  // Deterministic PRNG. Math.random would make the layout differ per render,
  // which breaks the 2D/3D transition and makes the page feel unstable.
  let seed = 20261009;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const pos: Record<string, Point> = {};
  for (const n of nodes) {
    pos[n.id] = { x: (rnd() - 0.5) * 12, y: (rnd() - 0.5) * 12, z: (rnd() - 0.5) * 12 };
  }

  const REPULSION = 26;
  const SPRING = 0.035;
  const REST = 4.4;
  const CENTERING = 0.012;

  for (let step = 0; step < 400; step++) {
    const force: Record<string, Point> = {};
    for (const n of nodes) force[n.id] = { x: 0, y: 0, z: 0 };

    // Every pair pushes apart, so unrelated projects do not pile up.
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const p = pos[nodes[i].id];
        const q = pos[nodes[j].id];
        let dx = p.x - q.x, dy = p.y - q.y, dz = p.z - q.z;
        let d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 0.01) {
          // Coincident points have no direction to separate along; nudge.
          dx = rnd() - 0.5; dy = rnd() - 0.5; dz = rnd() - 0.5;
          d2 = 0.01;
        }
        const d = Math.sqrt(d2);
        const f = REPULSION / d2;
        const fx = (dx / d) * f, fy = (dy / d) * f, fz = (dz / d) * f;
        force[nodes[i].id].x += fx; force[nodes[i].id].y += fy; force[nodes[i].id].z += fz;
        force[nodes[j].id].x -= fx; force[nodes[j].id].y -= fy; force[nodes[j].id].z -= fz;
      }
    }

    // Shared technology pulls together, more strongly the more they share.
    for (const e of edges) {
      const p = pos[e.a], q = pos[e.b];
      const dx = q.x - p.x, dy = q.y - p.y, dz = q.z - p.z;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 0.01;
      const f = SPRING * (d - REST) * Math.min(e.via.length, 3);
      const fx = (dx / d) * f, fy = (dy / d) * f, fz = (dz / d) * f;
      force[e.a].x += fx; force[e.a].y += fy; force[e.a].z += fz;
      force[e.b].x -= fx; force[e.b].y -= fy; force[e.b].z -= fz;
    }

    const damp = 0.82 * (1 - step / 600);
    for (const n of nodes) {
      const p = pos[n.id];
      p.x += (force[n.id].x - p.x * CENTERING) * damp;
      p.y += (force[n.id].y - p.y * CENTERING) * damp;
      p.z += (force[n.id].z - p.z * CENTERING) * damp;
    }
  }

  // Normalise into a predictable radius so the camera framing never depends on
  // how the simulation happened to settle.
  const maxR = Math.max(
    ...nodes.map((n) => {
      const p = pos[n.id];
      return Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
    })
  );
  const scale = maxR > 0 ? 8.2 / maxR : 1;
  for (const n of nodes) {
    pos[n.id].x *= scale;
    pos[n.id].y *= scale;
    pos[n.id].z *= scale;
  }

  return pos;
})();
