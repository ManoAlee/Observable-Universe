import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FrequencyUniverseProps {
    observer: THREE.Vector2
    entropy: number
    isDecoding?: boolean
}

export default function FrequencyUniverse({ observer, entropy, isDecoding = false }: FrequencyUniverseProps) {
    const meshRef = useRef<THREE.Mesh>(null)
    const [stabilization, setStabilization] = React.useState(0)
    const count = 64

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: new THREE.Vector2() },
            uEntropy: { value: entropy },
            uIsDecoding: { value: isDecoding ? 1.0 : 0.0 },
            uStabilization: { value: 0 }
        },
        vertexShader: `
            varying vec3 vPos;
            varying vec2 vUv;
            uniform float uTime;
            uniform vec2 uObserver;

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Multi-spectral frequency layers
                float w1 = sin(pos.x * 0.2 + uTime) * 1.5;
                float w2 = cos(pos.y * 0.3 - uTime * 0.8) * 1.2;
                float ripple = sin(length(pos.xy - uObserver * 20.0) * 0.4 - uTime * 2.0) * 2.0;
                
                pos.z += w1 + w2 + ripple;
                
                vPos = pos;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vPos;
            varying vec2 vUv;
            uniform float uTime;
            uniform float uEntropy;
            uniform float uIsDecoding;
            uniform float uStabilization;

            float hash(vec2 p) {
                return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
            }

            void main() {
                // Spectral color palette (Deep space frequencies)
                vec3 lowFreq = vec3(0.05, 0.0, 0.2);
                vec3 highFreq = vec3(0.0, 0.8, 1.0);
                vec3 cmbColor = vec3(1.0, 0.4, 0.1);
                
                float wave = sin(vPos.z * 0.8 + uTime);
                vec3 color = mix(lowFreq, highFreq, wave * 0.5 + 0.5);
                
                // Human Mapping Grid overlay
                float grid = (step(0.98, fract(vUv.x * 10.0)) + step(0.98, fract(vUv.y * 10.0))) * 0.3;
                color += vec3(0.0, 0.4, 0.2) * grid;
                
                // Stabilized Signal Glow
                float signal = exp(-length(vPos.xy) * 0.02) * uStabilization;
                color = mix(color, cmbColor, signal * 0.6);
                
                // Digital Deconstruction
                if (uIsDecoding > 0.5) {
                    float noise = hash(floor(vPos.xy * 2.0) + floor(uTime * 10.0));
                    if (noise > 0.95) {
                        gl_FragColor = vec4(0.0, 1.0, 0.5, 0.9);
                        return;
                    }
                }

                gl_FragColor = vec4(color, 0.7 + wave * 0.2);
            }
        `,
        transparent: true,
        wireframe: true,
        side: THREE.DoubleSide
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial
            const t = state.clock.getElapsedTime()
            mat.uniforms.uTime.value = t
            mat.uniforms.uObserver.value.lerp(observer, 0.1)
            mat.uniforms.uEntropy.value = entropy
            mat.uniforms.uIsDecoding.value = isDecoding ? 1.0 : 0.0

            // Stabilization logic: Hovering near center increases lock
            const dist = observer.length()
            if (dist < 0.2) {
                setStabilization(prev => Math.min(1, prev + 0.005))
            } else {
                setStabilization(prev => Math.max(0, prev - 0.002))
            }
            mat.uniforms.uStabilization.value = stabilization
        }
    })

    return (
        <group>
            <mesh ref={meshRef} rotation={[-Math.PI / 2.5, 0, 0]} position={[0, -15, 0]}>
                <planeGeometry args={[120, 120, 48, 48]} />
                <primitive object={material} attach="material" />
            </mesh>

            {/* Stabilized Data Points */}
            <SignalClusters count={30} intensity={stabilization} />

            {/* Human Observation Horizon */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -14.5, 0]}>
                <ringGeometry args={[30, 31, 64]} />
                <meshBasicMaterial color="#00ff88" transparent opacity={0.3} />
            </mesh>
        </group>
    )
}

function SignalClusters({ count, intensity }: { count: number; intensity: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 100
            pos[i * 3 + 1] = (Math.random() - 0.5) * 40
            pos[i * 3 + 2] = (Math.random() - 0.5) * 100
        }
        return pos
    }, [count])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * (0.05 + intensity * 0.2)
            if (pointsRef.current.material instanceof THREE.PointsMaterial) {
                pointsRef.current.material.opacity = 0.2 + intensity * 0.6
                pointsRef.current.material.size = 1.0 + intensity * 2.0
            }
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                />
            </bufferGeometry>
            <pointsMaterial
                size={1.5}
                color={intensity > 0.8 ? "#fff" : "#ffaa00"}
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}
