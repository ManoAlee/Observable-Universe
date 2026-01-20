import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Stars, Float, Text } from '@react-three/drei'
import * as THREE from 'three'

interface DarkMatterUniverseProps {
    observer: THREE.Vector2
    entropy: number
}

export default function DarkMatterUniverse({ observer, entropy }: DarkMatterUniverseProps) {
    return (
        <group>
            {/* Background: Dense, distant universe */}
            <Stars radius={200} depth={50} count={10000} factor={4} saturation={1} fade speed={0.5} />

            {/* The Invisible Matter - Gravitational Lensing Field */}
            <LensingField observer={observer} entropy={entropy} />

            {/* Volumetric Nebula Layers (The Deep Void) */}
            <VolumetricNebula />

            {/* Dark Matter Filaments (The Web) */}
            <DarkFilaments />

            {/* Label */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                <Text position={[0, 20, -50]} fontSize={5} color="#4400cc" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    SUBSPACE // DARK_MATTER_FLOW
                </Text>
            </Float>
        </group>
    )
}

function VolumetricNebula() {
    // We render multiple layers of noise to simulate 3D volume
    const layers = [10, 20, 30]

    const nebulaMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(0.05, 0.0, 0.15) }
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
            uniform vec3 uColor;
            varying vec2 vUv;

            // Simple pseudo-noise
            float noise(vec2 p) {
                return (sin(p.x * 10.0 + uTime * 0.1) + sin(p.y * 10.0 - uTime * 0.2)) * 0.5;
            }

            void main() {
                float n = noise(vUv * 3.0);
                float alpha = smoothstep(0.3, 0.7, n);
                gl_FragColor = vec4(uColor, alpha * 0.3); // Low opacity for layering
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])

    useFrame((state) => {
        nebulaMaterial.uniforms.uTime.value = state.clock.elapsedTime
    })

    return (
        <group>
            {layers.map((z, i) => (
                <mesh key={i} position={[0, 0, -z]} rotation={[0, 0, i]}>
                    <planeGeometry args={[150, 100]} />
                    <primitive object={nebulaMaterial} attach="material" />
                </mesh>
            ))}
        </group>
    )
}

function LensingField({ observer, entropy }: { observer: THREE.Vector2, entropy: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Shader to simulate light bending around invisible mass
    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: observer },
            uEntropy: { value: entropy }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec2 uObserver;
            uniform float uEntropy;

            void main() {
                vec2 center = vec2(0.5, 0.5) + (uObserver * 0.1); 
                float dist = distance(vUv, center);
                
                // Strong distortion near center (Event Horizon-ish)
                float distortion = 0.05 / (dist + 0.01) * (1.0 + uEntropy);
                
                // Dark Void Core
                vec3 color = vec3(0.0);
                
                // Lensing Grid Lines (Bending Light)
                float gridX = sin((vUv.x + distortion) * 40.0 + uTime);
                float gridY = sin((vUv.y + distortion) * 40.0);
                float grid = smoothstep(0.95, 1.0, gridX * gridY);
                
                color += vec3(0.2, 0.0, 0.5) * grid * (1.0 / dist); // Glowing bent lines

                gl_FragColor = vec4(color, 0.5 + distortion);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = state.clock.elapsedTime
            mat.uniforms.uObserver.value = observer
            mat.uniforms.uEntropy.value = entropy
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 0, -15]}>
            <planeGeometry args={[100, 60]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

function DarkFilaments() {
    // Procedural lines connecting invisible nodes
    const count = 30
    const lines = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const points = []
            points.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, -30))
            points.push(new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 60, -30))
            temp.push(points)
        }
        return temp
    }, [])

    return (
        <group>
            {lines.map((pts, i) => (
                <line key={i}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            count={2}
                            array={new Float32Array([...pts[0].toArray(), ...pts[1].toArray()])}
                            itemSize={3}
                        />
                    </bufferGeometry>
                    <lineBasicMaterial color="#220055" transparent opacity={0.3} />
                </line>
            ))}
        </group>
    )
}
