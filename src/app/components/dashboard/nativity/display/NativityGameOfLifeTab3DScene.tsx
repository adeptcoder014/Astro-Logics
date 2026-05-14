'use client'
import React, { useEffect, useRef } from 'react';

interface PlanetEntity {
  id: string;
  planet: string;
  position: [number, number, number];
  energy: number;
  mood: string;
  color: string;
  personality: string;
  lastMessage: string;
  isActive: boolean;
}

interface CanvasSceneProps {
  planets: PlanetEntity[];
  selectedPlanet: PlanetEntity | null;
  onSelectPlanet: (planet: PlanetEntity) => void;
}

export default function CanvasScene({
  planets,
  selectedPlanet,
  onSelectPlanet,
}: CanvasSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined' || !containerRef.current) {
      return;
    }

    let isActive = true;
    const container = containerRef.current;

    // Import Three.js library
    import('three').then((THREE) => {
      if (!isActive) return;

      // Scene setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      );
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setClearColor(0x0a0a0a);
      container.innerHTML = '';
      container.appendChild(renderer.domElement);

      // Camera position
      camera.position.set(0, 10, 20);

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0xffffff, 1);
      pointLight1.position.set(10, 10, 10);
      scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0xffffff, 0.5);
      pointLight2.position.set(-10, -10, -10);
      scene.add(pointLight2);

      // Sun
      const sunGeometry = new THREE.SphereGeometry(1.5, 32, 32);
      const sunMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        emissive: 0xffd700,
        emissiveIntensity: 0.8,
      });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      scene.add(sun);

      // Create planet meshes
      const planetMeshes = planets.map((p, idx) => {
        const distance = 4 + idx * 2;

        // Orbit line
        const orbitPoints = [];
        for (let i = 0; i < 64; i++) {
          const angle = (i / 64) * Math.PI * 2;
          orbitPoints.push(
            new THREE.Vector3(
              Math.cos(angle) * distance,
              0,
              Math.sin(angle) * distance
            )
          );
        }
        const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
        const orbitMaterial = new THREE.LineBasicMaterial({
          color: 0x444444,
          transparent: true,
          opacity: 0.3,
        });
        const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
        scene.add(orbitLine);

        // Planet sphere
        const geometry = new THREE.SphereGeometry(0.5, 32, 32);
        const material = new THREE.MeshStandardMaterial({
          color: p.color,
          emissive: p.color,
          emissiveIntensity: 0.6 + (p.energy / 100) * 0.4,
          wireframe: selectedPlanet?.id === p.id,
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(p.position[0], p.position[1], p.position[2]);
        mesh.userData = { planet: p };
        scene.add(mesh);

        // Energy ring
        const ringGeometry = new THREE.TorusGeometry(0.7, 0.05, 16, 100);
        const ringMaterial = new THREE.MeshStandardMaterial({
          color: p.color,
          emissive: p.color,
          emissiveIntensity: 0.5,
          transparent: true,
          opacity: p.energy / 100,
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        mesh.add(ring);

        return { mesh, planet: p };
      });

      // Mouse interaction
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      const onMouseClick = (event: MouseEvent) => {
        mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
        mouse.y = -(event.clientY / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const meshes = planetMeshes.map((pm) => pm.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
          const obj = intersects[0].object as THREE.Mesh;
          const planet = obj.userData.planet;
          onSelectPlanet(planet);
        }
      };

      container.addEventListener('click', onMouseClick);

      // Animation loop
      let animationFrameId: number;
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        // Sun rotation
        sun.rotation.x += 0.0005;
        sun.rotation.y += 0.001;

        // Planet animations
        planetMeshes.forEach(({ mesh, planet }) => {
          const pulse = 1 + Math.sin(Date.now() * 0.005) * (planet.energy / 100) * 0.2;
          mesh.scale.set(pulse, pulse, pulse);
          mesh.rotation.x += 0.003;
          mesh.rotation.y += 0.002;
          mesh.position.y = planet.position[1] + Math.sin(Date.now() * 0.003) * 0.5;

          // Update material for selection
          (mesh.material as THREE.MeshStandardMaterial).wireframe =
            selectedPlanet?.id === planet.id;
        });

        renderer.render(scene, camera);
      };

      animate();

      // Handle resize
      const handleResize = () => {
        if (!container) return;
        const width = container.clientWidth;
        const height = container.clientHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        isActive = false;
        window.removeEventListener('resize', handleResize);
        container.removeEventListener('click', onMouseClick);
        cancelAnimationFrame(animationFrameId);
        renderer.dispose();
      };
    });
  }, [planets, selectedPlanet, onSelectPlanet]);

  return (
    <div
      ref={containerRef}
      className="flex-1 border border-[#2D241E] rounded bg-[#0a0a0a] overflow-hidden"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
