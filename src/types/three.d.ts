import * as THREE from 'three';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      group: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.Group>,
        THREE.Group
      > & {
        position?: [number, number, number];
      };
      mesh: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.Mesh>,
        THREE.Mesh
      > & {
        rotation?: [number, number, number];
        position?: [number, number, number];
        onClick?: () => void;
      };
      bufferGeometry: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.BufferGeometry>,
        THREE.BufferGeometry
      >;
      bufferAttribute: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.BufferAttribute>,
        THREE.BufferAttribute
      > & {
        attach?: string;
        array?: Float32Array;
        count?: number;
        itemSize?: number;
      };
      meshStandardMaterial: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.MeshStandardMaterial>,
        THREE.MeshStandardMaterial
      > & {
        color?: string;
        emissive?: string;
        emissiveIntensity?: number;
        wireframe?: boolean;
        transparent?: boolean;
        opacity?: number;
      };
      torusGeometry: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.TorusGeometry>,
        THREE.TorusGeometry
      > & {
        args?: [number, number, number, number];
      };
      icosahedronGeometry: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.IcosahedronGeometry>,
        THREE.IcosahedronGeometry
      > & {
        args?: [number, number];
      };
      lineBasicMaterial: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.LineBasicMaterial>,
        THREE.LineBasicMaterial
      > & {
        color?: string;
        transparent?: boolean;
        opacity?: number;
      };
      ambientLight: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.AmbientLight>,
        THREE.AmbientLight
      > & {
        intensity?: number;
      };
      pointLight: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.PointLight>,
        THREE.PointLight
      > & {
        position?: [number, number, number];
        intensity?: number;
        castShadow?: boolean;
      };
      spotLight: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.SpotLight>,
        THREE.SpotLight
      > & {
        position?: [number, number, number];
        intensity?: number;
        angle?: number;
        penumbra?: number;
        castShadow?: boolean;
      };
      sphereGeometry: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.SphereGeometry>,
        THREE.SphereGeometry
      > & {
        args?: [number, number, number];
      };
      circleGeometry: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.CircleGeometry>,
        THREE.CircleGeometry
      > & {
        args?: [number, number];
      };
      planeGeometry: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.PlaneGeometry>,
        THREE.PlaneGeometry
      > & {
        args?: [number, number];
      };
      meshBasicMaterial: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.MeshBasicMaterial>,
        THREE.MeshBasicMaterial
      > & {
        color?: string;
        transparent?: boolean;
        opacity?: number;
        side?: THREE.Side;
      };
      shadowMaterial: React.DetailedHTMLProps<
        React.HTMLAttributes<THREE.ShadowMaterial>,
        THREE.ShadowMaterial
      > & {
        opacity?: number;
      };
    }
  }
}

export {};
