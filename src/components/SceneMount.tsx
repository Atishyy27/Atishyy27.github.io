"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { setLights, useLights } from "@/lib/lights";

/**
 * Mounts a WebGL scene only in the browser, only when the visitor has not
 * asked for reduced motion, and only when the lights are on. three.js lands in
 * its own chunk that the initial HTML never references, so someone who will
 * not see the scene never downloads it. Exists as a client component so Server
 * Components can use `ssr: false`, which they cannot do directly.
 */
const ProjectGraph = dynamic(() => import("./ProjectGraph"), { ssr: false });
const CoreScene = dynamic(() => import("./CoreScene"), { ssr: false });
const Keyboard3D = dynamic(() => import("./Keyboard3D"), { ssr: false });
const Avatar3D = dynamic(() => import("./Avatar3D"), { ssr: false });

type Mode = "unknown" | "yes" | "reduced" | "off";

/**
 * "off" is the visitor's own choice and outranks everything; "reduced" is the
 * operating system's. They are kept apart because they mean different things:
 * reduced motion still wants the scene, just still. Lights-off wants no canvas
 * at all.
 */
function useSceneMode(): Mode {
  const lights = useLights();
  const [reduced, setReduced] = useState<boolean | null>(null);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);
  if (lights === "unknown" || reduced === null) return "unknown";
  if (lights === "flat") return "off";
  return reduced ? "reduced" : "yes";
}

/**
 * What stands in for a switched-off canvas. A section whose only content is a
 * canvas reads as broken when the canvas is gone, and a visitor who flipped
 * the switch three pages ago has no idea why this one is empty. So it says so,
 * and offers the way back in the same breath.
 */
export function SceneOff({ what }: { what: string }) {
  return (
    <div className="scene-off mt-6">
      <span>lights are flat · {what} is not rendering</span>
      <button type="button" onClick={() => setLights("full")}>
        turn the lights on
      </button>
    </div>
  );
}

/** The project graph. Still renders under reduced motion, just without the drift. */
export function ProjectGraphMount() {
  const mode = useSceneMode();
  if (mode === "unknown") return <div className="h-[440px] sm:h-[560px]" aria-hidden />;
  if (mode === "off") return <SceneOff what="the project graph" />;
  return <ProjectGraph reducedMotion={mode === "reduced"} />;
}

/** The repository sphere on /oss. Skipped entirely under reduced motion: unlike
 *  the graph it has no controls of its own, so a still frame says nothing the
 *  table below it does not already say. Skipped silently when the lights are
 *  flat too, for the same reason: the table is the content, not the sphere. */
export function OssSceneMount() {
  const mode = useSceneMode();
  if (mode !== "yes") return null;
  return <CoreScene />;
}

/** The keyboard. Still renders under reduced motion: it responds to real
 *  keypresses, which is the point, and only the idle sway is motion. */
export function Keyboard3DMount() {
  const mode = useSceneMode();
  if (mode === "unknown") return <div className="h-[320px] sm:h-[400px]" aria-hidden />;
  if (mode === "off") return <SceneOff what="the keyboard" />;
  return <Keyboard3D reducedMotion={mode === "reduced"} />;
}

/**
 * The avatar. Takes `present` from the page, which checks on disk at build
 * time whether public/avatar.glb exists, because a client component cannot
 * know that and a 404 inside a Canvas renders as a silent empty box.
 */
export function Avatar3DMount({ present }: { present: boolean }) {
  const mode = useSceneMode();
  if (!present) return null;
  if (mode === "unknown") return <div className="h-[420px] sm:h-[520px]" aria-hidden />;
  if (mode === "off") return <SceneOff what="the avatar" />;
  return <Avatar3D reducedMotion={mode === "reduced"} />;
}
