'use client';

import { useRef, useMemo } from 'react';
import { PerspectiveCamera, editable as e, SheetProvider } from '@theatre/r3f';
import { getProject } from '@theatre/core';
import * as THREE from 'three';
import { Model } from '3d/Model_og';
import { Box } from './Box';

// Project is global
const project = getProject('Mundane Astro Logs');

export default function Scene({ intensity }: { intensity: number }) {
  const targetRef = useRef<THREE.Mesh>(null!);
  
  // Sheet is memoized to prevent re-creation on every render
  const sheet = useMemo(() => project.sheet('Main Scene'), []);

  return (
    <SheetProvider sheet={sheet}>
      <PerspectiveCamera
        theatreKey="Main_Camera"
        makeDefault
        position={[0, 2, 5]}
        fov={30}
      />

      <e.mesh theatreKey="Camera_Target" ref={targetRef} visible="editor">
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color="yellow" wireframe />
      </e.mesh>

      <e.directionalLight theatreKey="Sunlight" intensity={1} castShadow />
      <ambientLight intensity={0.5} />
      
      {/* Model now sits inside the Provider and receives the memoized sheet context */}
      {/* <Model intensity={intensity} /> */}
      <Box intensity={intensity} />
    </SheetProvider>
  );
}