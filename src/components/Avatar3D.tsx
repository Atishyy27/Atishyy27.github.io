"use client";

/**
 * The avatar, loaded from public/avatar.glb.
 *
 * There is deliberately no fallback figure. A generic humanoid standing in for
 * him would be worse than an empty space: the whole claim of this site is that
 * what you see is real, and a stock body with his name under it breaks that
 * for the sake of filling a rectangle. So the page only mounts this when the
 * file actually exists, checked on disk at build time, and says plainly that
 * it is missing when it is not there.
 *
 * Idle animation plays if the GLB carries one. Ready Player Me exports do not
 * by default, so a still model is the expected case and the slow turntable is
 * what keeps it from reading as a screenshot.
 */

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, useAnimations, Environment } from "@react-three/drei";
import * as THREE from "three";

const SRC = "/avatar.glb";

function Model({ spin }: { spin: boolean }) {
  const group = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(SRC);
  const { actions, names } = useAnimations(animations, group);

  useEffect(() => {
    // Play whatever the file ships with, if anything. Named "Idle" by
    // convention in most exporters, otherwise just take the first clip.
    const clip = names.find((n) => /idle/i.test(n)) ?? names[0];
    if (clip && actions[clip]) actions[clip].reset().fadeIn(0.4).play();
    return () => {
      if (clip && actions[clip]) actions[clip].fadeOut(0.3);
    };
  }, [actions, names]);

  useFrame((_, dt) => {
    if (group.current && spin) group.current.rotation.y += dt * 0.25;
  });

  // Normalise scale and footing: exporters disagree about units and about
  // whether the origin is at the feet or the hips, so the model is measured
  // and fitted rather than trusted.
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const height = size.y || 1;
    const s = 1.75 / height; // target roughly human height in scene units
    scene.scale.setScalar(s);
    const scaled = new THREE.Box3().setFromObject(scene);
    scene.position.y -= scaled.min.y; // stand on the floor, not through it
  }, [scene]);

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export default function Avatar3D({ reducedMotion = false }: { reducedMotion?: boolean }) {
  return (
    <div>
      <div className="relative h-[420px] w-full sm:h-[520px]">
        <Canvas
          camera={{ position: [0, 1.5, 3.4], fov: 35 }}
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          shadows
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[3, 5, 4]} intensity={1.4} castShadow />
          <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#5eb3b3" />

          <Suspense fallback={null}>
            <Model spin={!reducedMotion} />
            {/* A neutral studio environment, so skin and fabric are not lit
                by two bare lights and nothing else. */}
            <Environment preset="city" />
          </Suspense>

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            target={[0, 0.95, 0]}
            minPolarAngle={Math.PI / 3}
            maxPolarAngle={Math.PI / 1.9}
            rotateSpeed={0.5}
          />
        </Canvas>
      </div>
      <p className="text-[length:var(--step-small)] text-[var(--fg-muted)]">
        Drag to turn. Loaded from a GLB file, not a render.
      </p>
    </div>
  );
}

// Warm the file so the first frame is not an empty canvas.
useGLTF.preload(SRC);
