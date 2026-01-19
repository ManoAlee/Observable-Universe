import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DigitalRain from './DigitalRain';
import { Float } from '@react-three/drei';

export default function MatrixUniverse({ chaos = 0 }: { chaos?: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const observer = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.getElapsedTime();
      mat.uniforms.uChaos.value = chaos;
    }
  });

  const MatrixBackgroundShader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uChaos: { value: 0 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uChaos;
      varying vec2 vUv;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
      }

      void main() {
        vec2 st = vUv;
        if (uChaos > 0.8) {
            st.x += (random(vec2(uTime, floor(st.y * 100.0))) - 0.5) * 0.05 * uChaos;
        }

        float pct = random(floor(st * vec2(50.0, 10.0)) + floor(uTime * 5.0));
        vec3 color = mix(vec3(0.0, 0.2, 0.05), vec3(0.5, 0.0, 0.0), uChaos * uChaos);
        
        gl_FragColor = vec4(color * pct * 0.5, 0.2);
      }
    `,
  }), []);

  return (
    <group>
      {/* Volumetric Layers */}
      <DigitalRain intensity={chaos} observer={observer} />

      <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
        <group position={[0, 0, -20]}>
          <DigitalRain intensity={chaos * 0.5} observer={observer} />
        </group>
      </Float>

      {/* Deep Background Plane */}
      <mesh ref={meshRef} position={[0, 0, -50]} scale={[10, 10, 1]}>
        <planeGeometry args={[20, 20]} />
        <shaderMaterial
          {...MatrixBackgroundShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Ambient data particles */}
      <MatrixDust chaos={chaos} />
    </group>
  );
}

function MatrixDust({ chaos }: { chaos: number }) {
  const count = 1000;
  const pointsRef = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 150;
      p[i * 3 + 1] = (Math.random() - 0.5) * 150;
      p[i * 3 + 2] = (Math.random() - 0.5) * 150;
    }
    return p;
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
      pointsRef.current.position.z = Math.sin(state.clock.getElapsedTime() * 0.1) * 10;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color={chaos > 0.8 ? "#ff3300" : "#00ff66"}
        transparent
        opacity={0.2}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

