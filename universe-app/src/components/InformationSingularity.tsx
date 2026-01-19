import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SingularityProps {
    isDecoding?: boolean
}

export default function InformationSingularity({ isDecoding = false }: SingularityProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
        },
        vertexShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          void main() {
              vPos = position;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
      `,
        fragmentShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          uniform float uTime;

          void main() {
              float r = length(vPos) * 0.05;
              vec3 viewDir = normalize(cameraPosition - vPos);
              float fresnel = pow(1.0 - abs(dot(vNormal, viewDir)), 3.0);
              
              // Stable Data Sun Core
              float core = smoothstep(0.4, 0.0, r);
              
              // Radiating Data Rays
              float rays = max(0.0, sin(atan(vPos.y, vPos.x) * 20.0 + uTime) * sin(atan(vPos.z, vPos.x) * 20.0 + uTime * 0.5));
              rays *= smoothstep(0.0, 1.0, r);

              vec3 colorCore = vec3(0.0, 0.0, 0.0); // Black center
              vec3 colorRays = vec3(1.0, 0.8, 0.2); // Gold rays
              vec3 colorGlow = vec3(0.0, 0.8, 1.0); // Cyan glow
              
              vec3 finalColor = mix(colorCore, colorRays, rays);
              finalColor += colorGlow * fresnel;

              gl_FragColor = vec4(finalColor, 1.0);
          }
      `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime()
            meshRef.current.rotation.y += 0.0005
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[200, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}
