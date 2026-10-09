"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/**
 * Mounts a WebGL scene only in the browser, and only when the visitor has not
 * asked for reduced motion. three.js lands in its own chunk that the initial
 * HTML never references, so someone who will not see the scene never downloads
 * it. Exists as a client component so Server Components can use `ssr: false`,
 * which they cannot do directly.
 */
const ProjectGraph = dynamic(() => import("./ProjectGraph"), { ssr: false });
const CoreScene = dynamic(() => import("./CoreScene"), { ssr: false });
const Keyboard3D = dynamic(() => import("./Keyboard3D"), { ssr: false });
const Avatar3D = dynamic(() => import("./Avatar3D"), { ssr: false });

function useAllowed() {
  const [state, setState] = useState<"unknown" | "yes" | "reduced">("unknown");
  useEffect(() => {
    setState(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "reduced" : "yes"
    );
  }, []);
  return state;
}

/** The project graph. Still renders under reduced motion, just without the drift. */
export function ProjectGraphMount() {
  const allowed = useAllowed();
  if (allowed === "unknown") return <div className="h-[440px] sm:h-[560px]" aria-hidden />;
  return <ProjectGraph reducedMotion={allowed === "reduced"} />;
}

/** The repository sphere on /oss. Skipped entirely under reduced motion: unlike
 *  the graph it has no controls of its own, so a still frame says nothing the
 *  table below it does not already say. */
export function OssSceneMount() {
  const allowed = useAllowed();
  if (allowed !== "yes") return null;
  return <CoreScene />;
}

/** The keyboard. Still renders under reduced motion: it responds to real
 *  keypresses, which is the point, and only the idle sway is motion. */
export function Keyboard3DMount() {
  const allowed = useAllowed();
  if (allowed === "unknown") return <div className="h-[320px] sm:h-[400px]" aria-hidden />;
  return <Keyboard3D reducedMotion={allowed === "reduced"} />;
}

/**
 * The avatar. Takes `present` from the page, which checks on disk at build
 * time whether public/avatar.glb exists, because a client component cannot
 * know that and a 404 inside a Canvas renders as a silent empty box.
 */
export function Avatar3DMount({ present }: { present: boolean }) {
  const allowed = useAllowed();
  if (!present) return null;
  if (allowed === "unknown") return <div className="h-[420px] sm:h-[520px]" aria-hidden />;
  return <Avatar3D reducedMotion={allowed === "reduced"} />;
}
