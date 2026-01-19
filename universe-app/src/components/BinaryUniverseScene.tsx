import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shaderMaterial } from '@react-three/drei';
import { extend } from '@react-three/fiber';

// Custom shader material for binary pattern
const BinaryMaterial = shaderMaterial(
    { time: 0 },
    // vertex shader
    `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
    // fragment shader – creates a moving binary (0/1) pattern
    `
    uniform float time;
    varying vec2 vUv;
    // Simple pseudo‑random based on coordinates and time
    float rand(vec2 p){
      return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453 + time);
    }
    void main(){
      float r = rand(vUv * 20.0);
      // Threshold to get binary 0 or 1
      float bit = step(0.5, r);
      // Color: bright green for 1, dark black for 0
      vec3 col = mix(vec3(0.0,0.0,0.0), vec3(0.0,1.0,0.0), bit);
      gl_FragColor = vec4(col, 1.0);
    }
  `
);

extend({ BinaryMaterial });

export default function BinaryUniverseScene() {
    const meshRef = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
            // update uniform time for animation
            // @ts-ignore – Drei adds .material property
            meshRef.current.material.uniforms.time.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[10, 10, 32, 32]} />
            {/* @ts-ignore */}
            <binaryMaterial attach="material" />
        </mesh>
    );
}
