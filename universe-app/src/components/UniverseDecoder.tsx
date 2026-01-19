import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Points, PointMaterial, MeshDistortMaterial, Billboard } from '@react-three/drei'
import * as THREE from 'three'

interface UniverseDecoderProps {
    observer: THREE.Vector2
    entropy: number
    isDecoding: boolean
    lssi: number
    interactions?: any[]
    viewMode?: string
}

export default function UniverseDecoder({ observer, entropy, isDecoding, lssi, interactions, viewMode }: UniverseDecoderProps) {
    const groupRef = useRef<THREE.Group>(null)

    return (
        <group ref={groupRef}>
            {/* 1. Módulo de Hardware: Geometria do Espaço-Tempo (Einstein) */}
            <SpacetimeMetric observer={observer} entropy={entropy} lssi={lssi} />

            {/* 2. Módulo de Software: Campo de Higgs e BIOS Quântica */}
            <HiggsBIOS observer={observer} entropy={entropy} lssi={lssi} />

            {/* 3. Algoritmo de Unificação: Integrais de Caminho (Feynman) */}
            <PathIntegralVisualization observer={observer} />

            {/* 4. Saída de Dados: Projeção Holográfica e Entropia */}
            <HolographicBoundary entropy={entropy} />

            <DecoderLabels lssi={lssi} />

            {/* 5. Multiverse Dashboard: State of all active realities */}
            <MultiverseStatus currentMode={viewMode || 'OPERATOR'} />

            {/* 6. Interaction Visualizer: Floating data streams */}
            <InteractionVisualizer interactions={interactions || []} />
        </group>
    )
}

function SpacetimeMetric({ observer, entropy, lssi }: { observer: THREE.Vector2; entropy: number; lssi: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: observer },
            uEntropy: { value: entropy },
            uLSSI: { value: lssi }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vDistortion;
            uniform float uTime;
            uniform vec2 uObserver;
            uniform float uLSSI;
            uniform float uEntropy;

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Advanced Gravitational Lensing Simulation
                vec2 center = uObserver * 30.0;
                float dist = length(pos.xy - center);
                
                // General Relativity Curvature Simulation
                float schwarzschild = (2.0 * (1.0 + uEntropy)) / (dist + 0.5);
                float curvature = schwarzschild * 5.0 * (1.0 + uLSSI * 0.02);
                
                // Pulsing spacetime foam
                float wave = sin(dist * 0.5 - uTime * 3.0) * 0.5;
                pos.z += curvature + wave;
                
                vDistortion = curvature;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying float vDistortion;
            uniform float uTime;

            void main() {
                // High-fidelity holographic grid
                vec2 gridBase = fract(vUv * 40.0 - 0.5);
                vec2 gridLines = smoothstep(0.0, 0.05, gridBase) * smoothstep(1.0, 0.95, gridBase);
                float grid = 1.0 - (gridLines.x * gridLines.y);
                
                // Pulse effect
                float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
                
                vec3 color = mix(vec3(0.0, 0.2, 0.4), vec3(0.0, 1.0, 0.8), vDistortion * 0.3);
                float alpha = grid * (0.1 + vDistortion * 0.4) * pulse;
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = state.clock.getElapsedTime()
            mat.uniforms.uObserver.value.lerp(observer, 0.1)
            mat.uniforms.uLSSI.value = lssi
            mat.uniforms.uEntropy.value = entropy
        }
    })

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -25, 0]}>
            <planeGeometry args={[200, 200, 100, 100]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

function HiggsBIOS({ observer, entropy, lssi }: { observer: THREE.Vector2; entropy: number; lssi: number }) {
    const count = 100
    const pointsRef = useRef<THREE.Points>(null)

    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 40
            p[i * 3 + 1] = (Math.random() - 0.5) * 40
            p[i * 3 + 2] = (Math.random() - 0.5) * 40
        }
        return p
    }, [])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.005
            pointsRef.current.rotation.z += 0.002
        }
    })

    return (
        <group>
            <Points ref={pointsRef} positions={positions} stride={3}>
                <PointMaterial
                    transparent
                    color="#ff3366"
                    size={0.5}
                    sizeAttenuation={true}
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </Points>

            {/* Higgs Field Fog */}
            <mesh scale={30 + lssi * 0.1}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color={lssi > 50 ? "#ff0000" : "#330022"} transparent opacity={0.1 + lssi * 0.002} wireframe />
            </mesh>
        </group>
    )
}

function PathIntegralVisualization({ observer }: { observer: THREE.Vector2 }) {
    // Sum over histories: multiple faint lines converging on the observer
    const count = 5
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <HistoryLine key={i} index={i} observer={observer} />
            ))}
        </group>
    )
}

function HistoryLine({ index, observer }: { index: number; observer: THREE.Vector2 }) {
    const lineRef = useRef<THREE.Line>(null!)
    const points = useMemo(() => {
        const pts = []
        for (let i = 0; i < 20; i++) pts.push(new THREE.Vector3(0, 0, 0))
        return pts
    }, [])

    useFrame((state) => {
        if (lineRef.current) {
            const t = state.clock.getElapsedTime()
            const geom = lineRef.current.geometry as THREE.BufferGeometry
            const posAttr = geom.attributes.position as THREE.BufferAttribute

            for (let i = 0; i < 20; i++) {
                const ratio = i / 19
                const noise = Math.sin(t * 2 + index + ratio * 10) * (1.0 - ratio) * 5.0
                posAttr.setXYZ(i,
                    ratio * observer.x * 20 + noise,
                    ratio * observer.y * 20 + Math.cos(t + index) * 2.0,
                    -50 + ratio * 50
                )
            }
            posAttr.needsUpdate = true
        }
    })

    return (
        <primitive object={new THREE.Line()} ref={lineRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={20}
                    array={new Float32Array(20 * 3)}
                    itemSize={3}
                />
            </bufferGeometry>
            <lineBasicMaterial color="#00ffcc" transparent opacity={0.2} />
        </primitive>
    )
}

function HolographicBoundary({ entropy }: { entropy: number }) {
    return (
        <mesh position={[0, 0, -60]}>
            <planeGeometry args={[200, 120]} />
            <meshBasicMaterial color="#000" transparent opacity={0.7} />
            <Text
                position={[0, 50, 1]}
                fontSize={2}
                color="#00ffff"
                maxWidth={100}
                textAlign="center"
            >
                HOLOGRAPHIC_BOUNDARY // S = (Akc³)/(4Ghbar)
            </Text>
        </mesh>
    )
}

function DecoderLabels({ lssi }: { lssi: number }) {
    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Billboard position={[0, 40, 0]}>
                    <Text fontSize={2.5} color={lssi > 50 ? "#ff0000" : "#00ffff"}>
                        SENTINEL-Ø LSSI: {lssi.toFixed(2)}
                    </Text>
                </Billboard>
            </Float>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Billboard position={[-25, 10, 0]}>
                    <Text fontSize={0.8} color="#00ffff">METRIC_HARDWARE: Rμν - 1/2Rgμν = 8πG/c⁴ Tμν</Text>
                </Billboard>
            </Float>
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <Billboard position={[25, -10, 0]}>
                    <Text fontSize={0.8} color="#ff3366">SOFTWARE_BIOS: L = -1/4 FμνFμν + iψDψ</Text>
                </Billboard>
            </Float>
            <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
                <Billboard position={[0, 25, 10]}>
                    <Text fontSize={2.5} color="#00ffcc" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">UNIFICATION_ALGORITHM: Z = ∫Dg Dφ e^(iS/h)</Text>
                </Billboard>
            </Float>
        </group>
    )
}
function MultiverseStatus({ currentMode }: { currentMode: string }) {
    const modes = ['OPERATOR', 'GRAND_UNIFIED', 'WORMHOLE', 'STRING_THEORY', 'BINARY', 'QUANTUM', 'COSMIC_WEB', 'GENESIS', 'SINGULARITY', 'FREQUENCY', 'MATRIX']

    return (
        <group position={[-50, 0, -30]}>
            <Text position={[0, 15, 0]} fontSize={1.5} color="#00ffff" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">MULTIVERSE_SYNC_STATUS</Text>
            {modes.map((mode, i) => (
                <group key={mode} position={[0, 10 - i * 2.5, 0]}>
                    <mesh position={[-2, 0, 0]}>
                        <circleGeometry args={[0.5, 16]} />
                        <meshBasicMaterial
                            color={mode === currentMode ? "#00ff00" : "#ffffff"}
                            transparent={true}
                            opacity={mode === currentMode ? 1 : 0.2}
                        />
                    </mesh>
                    <Text position={[8, 0, 0]} fontSize={1} color={mode === currentMode ? "#00ff00" : "#cccccc"} textAlign="left" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">
                        {mode} {mode === currentMode ? '>> ACTIVE' : '>> STANDBY'}
                    </Text>
                </group>
            ))}
        </group>
    )
}

function InteractionVisualizer({ interactions }: { interactions: any[] }) {
    return (
        <group position={[50, 0, -30]}>
            <Text position={[0, 15, 0]} fontSize={1.5} color="#ff3366" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">REALTIME_INTERACTION_STREAM</Text>
            {interactions.slice(0, 5).map((int, i) => (
                <Float key={i} speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Billboard position={[0, 10 - i * 4, 0]}>
                        <Text fontSize={0.8} color="#ff3366" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">
                            {`[${int.name}] ${int.type} @ DIST:${int.distance?.toFixed(2)}`}
                        </Text>
                    </Billboard>
                </Float>
            ))}
        </group>
    )
}
