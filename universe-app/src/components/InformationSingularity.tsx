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
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[200, 64, 64]} />
                <primitive object={material} attach="material" />
            </mesh>

            {/* Digital Binary Rings */}
            {isDecoding && Array.from({ length: 5 }).map((_, i) => (
                <BinaryRing key={i} radius={50 + i * 30} speed={0.02 + i * 0.01} direction={i % 2 === 0 ? 1 : -1} />
            ))}
        </group>
    )
}

function BinaryRing({ radius, speed, direction }: { radius: number, speed: number, direction: number }) {
    const ref = useRef<THREE.Group>(null)
    const textRef = useRef<any>(null)

    // Generate long binary string
    const binaryString = useMemo(() => Array.from({ length: 40 }).map(() => Math.random() > 0.5 ? '1' : '0').join(' '), [])

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.z += speed * direction * 0.1
            ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.2
        }
    })

    return (
        <group ref={ref} rotation={[Math.PI / 2, 0, 0]}>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[radius, radius + 1, 64]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Visual Text (Simplified: repeated characters along ring is hard in standard Drei Text without curving) */}
            {/* Using simply Sprite indicators for now or just the ring geometry as "data path" */}
        </group>
    )
}
