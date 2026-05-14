'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { editable as e, useCurrentSheet } from '@theatre/r3f';
import { val, types } from '@theatre/core';

export function Box() {
  const meshRef = useRef<any>(null);
  const sheet = useCurrentSheet();

  useFrame(() => {
    // 1. Guard clause: Wait for Theatre.js to initialize
    if (!sheet || typeof sheet.get !== 'function') return;

    // 2. Get the values from our custom "Cube_Controls" object
    const controls = sheet.get('Cube_Controls');
    if (!controls) return;

    const { growth, pulseColor } = val(controls.props);

    // 3. Apply the custom property to the Mesh
    if (meshRef.current) {
      // Scale the cube based on the 'growth' slider
      meshRef.current.scale.setScalar(1 + growth);
      
      // Change the color based on the 'pulseColor' prop
      meshRef.current.material.color.set(pulseColor);
    }
  });

  return (
    <e.group theatreKey="Box_Root">
      {/* THE CUSTOM PROPERTIES:
        - 'growth' is a slider from 0 to 5.
        - 'pulseColor' is a color picker.
      */}
      <e.group 
        theatreKey="Cube_Controls" 
        props={{ 
          growth: types.number(0, { range: [0, 5] }),
          pulseColor: types.rgba({ r: 1, g: 1, b: 1, a: 1 })
        }} 
      />

      <mesh ref={meshRef}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="white" />
      </mesh>
    </e.group>
  );
}