'use client'

import * as THREE from 'three'
import React, { useMemo, useEffect, useRef } from 'react'
import { useGraph, useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import { SkeletonUtils } from 'three-stdlib'

export function Character({ 
  activeAction = 'Idle', 
  mood = 'neutral', 
  planetColor = '#ffffff',
  ...props 
}: any) {
  const group = useRef<THREE.Group>(null!)
  const { scene, animations } = useGLTF('/character-transformed.glb')
  
  const clone = useMemo(() => {
    const instance = SkeletonUtils.clone(scene)
    instance.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh
        mesh.material = mesh.material.clone()
        const mat = mesh.material as THREE.MeshStandardMaterial
        
        if (mat.map) {
          mat.map = mat.map.clone()
          mat.transparent = true
          mat.side = THREE.DoubleSide
          mat.map.flipY = false // CRITICAL for GLB textures
          mat.map.needsUpdate = true
        }
      }
    })
    return instance
  }, [scene])

  const { nodes } = useGraph(clone) as any
  const { actions } = useAnimations(animations, group)

  // Apply Planet Color
  useEffect(() => {
    if (nodes.body) nodes.body.material.color.set(planetColor)
  }, [planetColor, nodes.body])

  // Play Animations
  useEffect(() => {
    const action = actions[activeAction]
    if (action) {
      action.reset().fadeIn(0.2).play()
      return () => { action.fadeOut(0.2) }
    }
  }, [activeAction, actions])

  useFrame((state) => {
    const eyeMat = nodes.eyes?.material as THREE.MeshStandardMaterial
    const mouthMat = nodes.mouth?.material as THREE.MeshStandardMaterial

    if (!eyeMat?.map || !mouthMat?.map) return

    // Simplified 4x4 Map
    // If faces are missing, swap 0.75 for 0.00 (and vice versa) to test top/bottom
    const atlasMap = {
      neutral:   { x: 0.00, y: 0.75 },
      happy:     { x: 0.25, y: 0.75 },
      angry:     { x: 0.50, y: 0.75 },
      sarcastic: { x: 0.75, y: 0.75 },
      sad:       { x: 0.00, y: 0.50 },
    }

    const target = atlasMap[mood as keyof typeof atlasMap] || atlasMap.neutral

    // EYES: Lock to 1/4 size
    eyeMat.map.repeat.set(0.25, 0.25)
    eyeMat.map.offset.set(target.x, target.y)

    // MOUTH: 512x1024 sheet (0.5 width, 0.25 height)
    mouthMat.map.repeat.set(0.5, 0.25)
    
    let currentMouthY = target.y
    if (activeAction === 'Talk') {
      // Jump between two rows of the mouth atlas
      const flap = Math.sin(state.clock.elapsedTime * 18) > 0 ? 0 : 0.25
      currentMouthY = target.y - flap 
    }
    
    // x*2 because the mouth sheet is half the width of the eyes sheet
    mouthMat.map.offset.set(target.x * 2, currentMouthY)
  })

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.root} />
      <skinnedMesh name="body" geometry={nodes.body.geometry} material={nodes.body.material} skeleton={nodes.body.skeleton} castShadow />
      <skinnedMesh name="eyes" geometry={nodes.eyes.geometry} material={nodes.eyes.material} skeleton={nodes.eyes.skeleton} />
      <skinnedMesh name="mouth" geometry={nodes.mouth.geometry} material={nodes.mouth.material} skeleton={nodes.mouth.skeleton} />
    </group>
  )
}