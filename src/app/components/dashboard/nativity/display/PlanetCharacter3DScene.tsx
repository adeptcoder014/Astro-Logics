'use client'
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { ENTITY_CONFIG } from './entityConfig';

interface SceneProps {
  personality: {
    mood: string;
    traits: string[];
    color: string;
    energy: number;
  };
  planet: string;
  isActive: boolean;
}

export default function PlanetCharacter3DScene({
  personality,
  planet,
  isActive,
}: SceneProps) {
  const cameraPos = ENTITY_CONFIG.CAMERA.defaultPosition as [number, number, number];

  return (
    <Canvas
      camera={{ position: cameraPos, fov: ENTITY_CONFIG.CAMERA.fov }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={ENTITY_CONFIG.VISUALS.ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={ENTITY_CONFIG.VISUALS.directionalIntensity} />

      <CharacterMesh
        planet={planet}
        personality={personality}
        isActive={isActive}
      />

      <OrbitControls
        autoRotate={ENTITY_CONFIG.CAMERA.autoRotate && !isActive}
        autoRotateSpeed={ENTITY_CONFIG.ANIMATION.autoRotateSpeed}
        enableZoom={ENTITY_CONFIG.CAMERA.enableZoom}
        enablePan={ENTITY_CONFIG.CAMERA.enablePan}
      />
    </Canvas>
  );
}

interface CharacterMeshProps {
  personality: {
    mood: string;
    traits: string[];
    color: string;
    energy: number;
  };
  planet: string;
  isActive: boolean;
}

function CharacterMesh({ personality, isActive }: CharacterMeshProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  // Parse color to THREE color
  const colorValue = new THREE.Color(personality.color || '#e29626');

  useFrame((state) => {
    if (!meshRef.current) return;

    const config = ENTITY_CONFIG.ANIMATION;

    // Idle animation - gentle floating
    if (isActive) {
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * config.idleFloatSpeed) * config.idleFloatHeight;
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.4) * config.rotationIntensity;
    }

    // Hover effect
    if (hovered) {
      meshRef.current.scale.lerp(
        new THREE.Vector3(config.hoverScaleAmount, config.hoverScaleAmount, config.hoverScaleAmount),
        config.hoverScaleLerp
      );
      meshRef.current.rotation.x += 0.01;
    } else {
      meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), config.hoverScaleLerp);
    }
  });

  return (
    <group
      ref={meshRef}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Main body - sphere with energy aura */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          color={colorValue}
          emissive={colorValue}
          emissiveIntensity={personality.energy * 0.8}
          metalness={ENTITY_CONFIG.VISUALS.metalness}
          roughness={ENTITY_CONFIG.VISUALS.roughness}
        />
      </mesh>

      {/* Energy aura - rings expanding based on energy */}
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[ENTITY_CONFIG.VISUALS.primaryRingScale(personality.energy), 0.15, 32, 32]} />
        <meshStandardMaterial
          color={colorValue}
          emissive={colorValue}
          emissiveIntensity={personality.energy * 0.5}
          transparent
          opacity={ENTITY_CONFIG.VISUALS.primaryRingOpacity}
        />
      </mesh>

      {/* Secondary rings for visual interest */}
      <mesh rotation={[0, 0, Math.PI / 4.5]}>
        <torusGeometry args={[ENTITY_CONFIG.VISUALS.secondaryRingScale(personality.energy), 0.1, 32, 32]} />
        <meshStandardMaterial
          color={colorValue}
          emissive={colorValue}
          emissiveIntensity={personality.energy * 0.3}
          transparent
          opacity={ENTITY_CONFIG.VISUALS.secondaryRingOpacity}
        />
      </mesh>

      {/* Glow point lights */}
      <pointLight
        intensity={personality.energy * 0.8}
        distance={ENTITY_CONFIG.VISUALS.pointLightDistance}
        color={colorValue}
      />
    </group>
  );
}

interface SceneProps {
  personality: {
    mood: string;
    traits: string[];
    color: string;
    energy: number;
  };
  planet: string;
  isActive: boolean;
}

export default function PlanetCharacter3DScene({
  personality,
  planet,
  isActive,
}: SceneProps) {
  const cameraPos = ENTITY_CONFIG.CAMERA.defaultPosition as [number, number, number];

  return (
    <Canvas
      camera={{ position: cameraPos, fov: ENTITY_CONFIG.CAMERA.fov }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={ENTITY_CONFIG.VISUALS.ambientIntensity} />
      <directionalLight position={[5, 5, 5]} intensity={ENTITY_CONFIG.VISUALS.directionalIntensity} />

      <CharacterMesh
        planet={planet}
        personality={personality}
        isActive={isActive}
      />

      <OrbitControls
        autoRotate={ENTITY_CONFIG.CAMERA.autoRotate && !isActive}
        autoRotateSpeed={ENTITY_CONFIG.ANIMATION.autoRotateSpeed}
        enableZoom={ENTITY_CONFIG.CAMERA.enableZoom}
        enablePan={ENTITY_CONFIG.CAMERA.enablePan}
      />
    </Canvas>
  );
}
