"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function KneeModel() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (group.current) {
      group.current.rotation.y = state.clock.elapsedTime * 0.3;
      group.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={group}>
      {/* Femur */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.12, 0.18, 1.8, 8]} />
        <meshBasicMaterial color="#0EA5E9" wireframe opacity={0.7} transparent />
      </mesh>
      {/* Joint sphere */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.22, 12, 8]} />
        <meshBasicMaterial color="#10B981" wireframe opacity={0.6} transparent />
      </mesh>
      {/* Tibia */}
      <mesh position={[0, -1.1, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 1.6, 8]} />
        <meshBasicMaterial color="#0EA5E9" wireframe opacity={0.7} transparent />
      </mesh>
      {/* Patella */}
      <mesh position={[0.25, 0.1, 0.18]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshBasicMaterial color="#6366F1" wireframe opacity={0.5} transparent />
      </mesh>
    </group>
  );
}

export default function HeroScene() {
  return (
    <div className="w-full h-full min-h-[500px] relative z-10">
      <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <KneeModel />
      </Canvas>
    </div>
  );
}
