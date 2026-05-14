'use client';

import { useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useRef } from 'react';

export default function CameraRig({ targetPos }: { targetPos: THREE.Vector3 | null }) {
  const group = useRef<THREE.Group>(null!);
  const lookAtVec = useRef(new THREE.Vector3(0, 0, 0));
  
  const vec = new THREE.Vector3();
  const worldCenter = new THREE.Vector3(0, 18, 38); // Overview Bird's Eye

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (targetPos) {
      // THE CLOSE UP: Glide to the specific House sector
      const direction = new THREE.Vector3().copy(targetPos).normalize();
      const offset = direction.multiplyScalar(6); // Distance from character
      vec.copy(targetPos).add(new THREE.Vector3(offset.x, 2, offset.z));
      
      state.camera.position.lerp(vec, 0.04);
      lookAtVec.current.lerp(targetPos, 0.06);
    } else {
      // THE WIDE SHOT: Global View
      state.camera.position.lerp(worldCenter, 0.03);
      lookAtVec.current.lerp(new THREE.Vector3(0, 0, 0), 0.03);
    }

    // Handheld camera shake & Mouse parallax
    state.camera.position.x += state.mouse.x * 0.4;
    state.camera.position.y += state.mouse.y * 0.4;
    state.camera.lookAt(lookAtVec.current);
    
    // Sub-bass breathing motion
    group.current.position.y = Math.sin(t * 0.5) * 0.08;
  });

  return (
    <group ref={group}>
      <PerspectiveCamera makeDefault fov={45} near={0.1} far={2000} />
    </group>
  );
}