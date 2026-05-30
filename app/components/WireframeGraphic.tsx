"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, Cylinder } from "@react-three/drei";
import * as THREE from "three";

function Leg({ position, delay }: { position: [number, number, number], delay: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
    }
  });

  const wireframeMaterial = (
    <meshStandardMaterial 
      color="#10b981" 
      wireframe={true} 
      transparent={true} 
      opacity={0.7} 
    />
  );

  const solidMaterial = (
    <meshStandardMaterial 
      color="#10b981" 
    />
  );

  return (
    <group ref={groupRef} position={position}>
      {/* Top Joint (Hip) */}
      <Sphere args={[0.5, 16, 16]} position={[0, 3, 0]}>
        {wireframeMaterial}
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0, 3, 0]}>
        {solidMaterial}
      </Sphere>

      {/* Thigh */}
      <Cylinder args={[0.05, 0.05, 3]} position={[0, 1.5, 0]}>
        <meshStandardMaterial color="#005f73" transparent={true} opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 3]} position={[0.2, 1.5, 0]}>
        <meshStandardMaterial color="#005f73" transparent={true} opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 3]} position={[-0.2, 1.5, 0]}>
        <meshStandardMaterial color="#005f73" transparent={true} opacity={0.5} />
      </Cylinder>

      {/* Middle Joint (Knee) */}
      <Sphere args={[0.6, 16, 16]} position={[0, 0, 0]}>
        {wireframeMaterial}
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0, 0, 0]}>
        {solidMaterial}
      </Sphere>

      {/* Calf */}
      <Cylinder args={[0.05, 0.05, 3]} position={[0, -1.5, 0]}>
        <meshStandardMaterial color="#005f73" transparent={true} opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 3]} position={[0.15, -1.5, 0]}>
        <meshStandardMaterial color="#005f73" transparent={true} opacity={0.5} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 3]} position={[-0.15, -1.5, 0]}>
        <meshStandardMaterial color="#005f73" transparent={true} opacity={0.5} />
      </Cylinder>

      {/* Bottom Joint (Ankle) */}
      <Sphere args={[0.4, 16, 16]} position={[0, -3, 0]}>
        {wireframeMaterial}
      </Sphere>
      <Sphere args={[0.15, 16, 16]} position={[0, -3, 0]}>
        {solidMaterial}
      </Sphere>
    </group>
  );
}

function Scene() {
  const sceneRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (sceneRef.current) {
      // Revolve the entire scene slowly
      sceneRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group ref={sceneRef}>
      {/* Two legs side by side */}
      <Leg position={[-0.8, 0, 0]} delay={0} />
      <Leg position={[0.8, 0, 0]} delay={Math.PI} />
    </group>
  );
}

export default function WireframeGraphic() {
  return (
    <div className="w-full h-[600px] absolute inset-0 z-10">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
        <ambientLight intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={2} />
        <Scene />
      </Canvas>
    </div>
  );
}
