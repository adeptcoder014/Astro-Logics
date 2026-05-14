'use client';

import * as THREE from 'three';
import { editable as e } from '@theatre/r3f';
import { useTexture } from '@react-three/drei';
import { useMemo } from 'react';

export default function CinematicBackground({ 
  color = "#1a1a2e", 
  texturePath = '/textures/montreal-day-view.jpg' 
}) {
  const texture = useTexture(texturePath);
  
  useMemo(() => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
  }, [texture]);

  return (
    <group>
      {/* Primary Environment Sphere */}
      <e.mesh theatreKey="Universe_Background" scale={[-200, 200, 200]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshBasicMaterial
          map={texture}
          color={color}
          side={THREE.BackSide}
          toneMapped={false}
          transparent
        />
      </e.mesh>

      {/* Fog/Atmosphere Tint */}
      <e.mesh theatreKey="Atmosphere_Tint" scale={[-190, 190, 190]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          transparent
          opacity={0.4}
          color="#000000"
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </e.mesh>
    </group>
  );
}