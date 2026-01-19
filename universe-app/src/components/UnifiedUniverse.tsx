import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Points, PointMaterial, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'

interface UnifiedUniverseProps {
    observer: THREE.Vector2
    entropy: number
    depth: number
    isDecoding?: boolean
    speed?: number
}

export default function UnifiedUniverse({ observer, entropy, depth, isDecoding = false, speed = 0 }: UnifiedUniverseProps) {
    const mainRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (mainRef.current) {
            mainRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })

    return (
        <group ref={mainRef}>
            {/* The Core Singularity (Quantum + String convergence) */}
            <Singularity observer={observer} entropy={entropy} isDecoding={isDecoding} speed={speed} />

            {/* Quantum Harmonic Orbital (Simplified Volumetric) */}
            <QuantumOrbital observer={observer} entropy={entropy} isDecoding={isDecoding} />

            {/* Manifold Strings (String Theory Layer) */}
            <UnifiedStrings observer={observer} />

            {/* Binary Data Strands (Binary Layer) */}
            <BinaryStrands observer={observer} depth={depth} />

            {/* Volumetric Haze (Holographic Atmosphere) */}
            <AtmosHaze observer={observer} />

            {/* 3D Holographic Labels (Part of HUD v7.0) */}
            <HolographicMarkers observer={observer} />
        </group>
    )
}

function Singularity({ observer, entropy, isDecoding, speed }: { observer: THREE.Vector2; entropy: number; isDecoding: boolean; speed: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: observer },
            uEntropy: { value: entropy },
            uIsDecoding: { value: isDecoding ? 1.0 : 0.0 },
            uSpeed: { value: speed }
        },
        vertexShader: `
            varying vec3 vPos;
            varying vec3 vNormal;
            uniform float uTime;
            uniform vec2 uObserver;
            
            void main() {
                vPos = position;
                vNormal = normalize(normalMatrix * normal);
                
                // Observer Perturbation (Kinetic Distortion)
                vec3 obsP = vec3(uObserver * 10.0, 0.0);
                float dist = length(position - obsP);
                float force = 1.0 / (dist * 0.5 + 1.0);
                
                vec3 pos = position + normal * sin(uTime * 10.0 + position.y * 5.0) * force * 0.5;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vPos;
            varying vec3 vNormal;
            uniform float uTime;
            uniform vec2 uObserver;
            uniform float uEntropy;
            uniform float uIsDecoding;
            uniform float uSpeed;

            float noise(vec3 p) {
                return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            }

            // PBR Scattering Approximation
            vec3 scatter(vec3 color, float dist, vec3 lPos) {
                float scattering = exp(-dist * 0.2);
                float mie = pow(max(0.0, dot(normalize(vPos), normalize(lPos))), 8.0) * 0.5;
                return color * scattering + vec3(1.0, 0.9, 0.7) * mie;
            }

            void main() {
                float dist = length(vPos);
                float glow = pow(0.7 / (dist + 0.1), 3.0);
                
                // Fresnel effect for volumetric boundary
                float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 3.0);
                
                // Interference pattern
                float interference = sin(dist * 12.0 - uTime * 6.0) * 0.5 + 0.5;
                
                // Pulsating core
                float pulse = sin(uTime * 4.0) * 0.15 + 0.85;
                
                // Observer interaction (Singularity distortion)
                vec3 obsP = vec3(uObserver * 10.0, 0.0);
                float obsDist = length(vPos - obsP);
                float influence = 1.0 / (obsDist * 0.4 + 0.5);
                
                // Volumetric noise detail
                float n = noise(vPos * 0.6 + uTime * 0.15);
                
                vec3 baseColor = mix(vec3(0.0, 1.0, 1.0), vec3(1.0, 0.1, 0.3), influence * uEntropy + n * 0.2);
                vec3 finalColor = scatter(baseColor, dist, obsP);

                // Kinetic Decompilation logic
                if (uIsDecoding > 0.5) {
                    float noiseVal = fract(sin(dot(vPos ,vec3(12.9898,78.233,45.5432))) * 43758.5453);
                    if (noiseVal < uSpeed * 4.0) {
                        float bit = step(0.5, fract(sin(vPos.x * 10.0 + uTime) * 43758.5453));
                        gl_FragColor = vec4(0.0, 1.0, 0.3, bit * 0.5);
                        return;
                    }
                }
                
                gl_FragColor = vec4(finalColor * glow * pulse * (0.8 + interference * 0.2) + vec3(fresnel * 0.3), glow * 0.8);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = state.clock.getElapsedTime()
            mat.uniforms.uObserver.value.lerp(observer, 0.1)
            mat.uniforms.uEntropy.value = entropy
            mat.uniforms.uIsDecoding.value = isDecoding ? 1.0 : 0.0
            mat.uniforms.uSpeed.value = THREE.MathUtils.lerp(mat.uniforms.uSpeed.value, speed, 0.1)
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[5, 64, 64]} />
            <primitive object={material} attach="material" />
            <pointLight intensity={10} distance={50} color="#00ffff" />
        </mesh>
    )
}

function QuantumOrbital({ observer, entropy, isDecoding }: { observer: THREE.Vector2; entropy: number; isDecoding: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: observer },
            uEntropy: { value: entropy },
            uIsDecoding: { value: isDecoding ? 1.0 : 0.0 }
        },
        vertexShader: `
            varying vec3 vPos;
            void main() {
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vPos;
            uniform float uTime;
            uniform vec2 uObserver;
            uniform float uEntropy;
            uniform float uIsDecoding;

            void main() {
                float r = length(vPos);
                float theta = acos(vPos.z / (r + 0.1));
                float phi = atan(vPos.y, vPos.x);
                
                // Unified Wave Function: Bipolar Orbital
                float wave = sin(2.0 * theta) * cos(phi + uTime);
                float radial = exp(-r / 3.0) * pow(r, 2.0);
                
                float prob = abs(wave * radial);
                
                // Color shift based on entropy
                vec3 color = mix(vec3(0.0, 0.8, 1.0), vec3(1.0, 1.0, 1.0), uEntropy);
                
                // Kinetic Decompilation logic (Simpler for orbitals)
                if (uIsDecoding > 0.5) {
                    float noise = fract(sin(vPos.y * 100.0 + uTime) * 43758.5453);
                    if (noise > 0.95) {
                        gl_FragColor = vec4(0.0, 1.0, 0.5, 0.8);
                        return;
                    }
                }

                gl_FragColor = vec4(color, prob * 0.1);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            const t = state.clock.getElapsedTime();
            mat.uniforms.uTime.value = t;
            mat.uniforms.uObserver.value.lerp(observer, 0.1);

            // Mouse velocity as a "Physical Pressure"
            const scale = 3 + Math.abs(observer.x + observer.y) * 2;
            meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
        }
    })

    return (
        <mesh ref={meshRef} scale={3}>
            <sphereGeometry args={[10, 32, 32]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

function UnifiedStrings({ observer }: { observer: THREE.Vector2 }) {
    const count = 30
    const instancedRef = useRef<THREE.InstancedMesh>(null)

    const strings = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            radius: 15 + Math.random() * 20,
            angle: (i / count) * Math.PI * 2,
            speed: 0.2 + Math.random() * 0.5,
            offset: Math.random() * 10
        }))
    }, [])

    useFrame((state) => {
        if (!instancedRef.current) return
        const t = state.clock.getElapsedTime()
        const dummy = new THREE.Object3D()

        strings.forEach((s, i) => {
            const angle = s.angle + t * s.speed
            const x = Math.cos(angle) * s.radius
            const z = Math.sin(angle) * s.radius
            const y = Math.sin(t + s.offset) * 5

            dummy.position.set(x, y, z)
            dummy.scale.setScalar(0.5 + Math.sin(t * 2 + i) * 0.2)
            dummy.rotation.set(t, t * 0.5, angle)
            dummy.updateMatrix()
            instancedRef.current!.setMatrixAt(i, dummy.matrix)
        })
        instancedRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={instancedRef} args={[new THREE.TorusGeometry(1, 0.05, 16, 100), new THREE.MeshBasicMaterial({ color: '#00ccff', transparent: true, opacity: 0.4 }), count]} />
    )
}

function BinaryStrands({ observer, depth }: { observer: THREE.Vector2; depth: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const count = 2000

    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 40 + Math.random() * 60
            const theta = Math.random() * Math.PI * 2
            p[i * 3] = Math.cos(theta) * r
            p[i * 3 + 1] = (Math.random() - 0.5) * 50
            p[i * 3 + 2] = Math.sin(theta) * r
        }
        return p
    }, [])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.002
        }
    })

    return (
        <Points ref={pointsRef} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color="#00ff44"
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.3}
            />
        </Points>
    )
}

function AtmosHaze({ observer }: { observer: THREE.Vector2 }) {
    return (
        <mesh scale={200}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial side={THREE.BackSide} color="#050010" transparent opacity={0.6} />
        </mesh>
    )
}

function HolographicMarkers({ observer }: { observer: THREE.Vector2 }) {
    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Billboard position={[0, 12, 0]}>
                    <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                        <octahedronGeometry args={[1.5]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} wireframe />
                    </mesh>
                    {/* Visual Line */}
                    <mesh position={[0, -3, 0]}>
                        <boxGeometry args={[20, 0.05, 0.05]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
                    </mesh>
                </Billboard>
            </Float>

            <Billboard position={[35, 0, -20]}>
                <mesh rotation={[0, Math.PI / 4, 0]}>
                    <icosahedronGeometry args={[1.2]} />
                    <meshBasicMaterial color="#00ff44" transparent opacity={0.4} wireframe />
                </mesh>
                <Text position={[0, -2, 0]} fontSize={0.6} color="#00ff44" fillOpacity={0.5} font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">
                    BIT_DENSITY: LANDAUER_LIMIT_SYNC
                </Text>
            </Billboard>

            <Billboard position={[-35, 15, -10]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1, 0.1, 16, 32]} />
                    <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
                </mesh>
                <Text position={[0, -2, 0]} fontSize={0.6} color="#ff00ff" fillOpacity={0.5} font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">
                    STRING_TENSION: M_THEORY_STABLE
                </Text>
            </Billboard>
        </group>
    )
}
