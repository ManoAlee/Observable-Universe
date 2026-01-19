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
    onNavigate?: (mode: any) => void
}

export default function UniverseDecoder({ observer, entropy, isDecoding, lssi, interactions, viewMode, onNavigate }: UniverseDecoderProps) {
    const groupRef = useRef<THREE.Group>(null)

    return (
        <group ref={groupRef}>
            {/* Visuals: Deep Background & Neural Grid */}
            <DeepCodeBackground />
            <NeuralDataGrid />

            {/* 1. Módulo de Hardware: Geometria do Espaço-Tempo (Einstein) */}
            <SpacetimeMetric observer={observer} entropy={entropy} lssi={lssi} />

            {/* 2. Módulo de Software: Campo de Higgs e BIOS Quântica */}
            <HiggsBIOS observer={observer} entropy={entropy} lssi={lssi} />

            {/* 3. Algoritmo de Unificação: Integrais de Caminho (Feynman) */}
            <PathIntegralVisualization observer={observer} />

            {/* 4. Saída de Dados: Projeção Holográfica e Entropia */}
            <HolographicBoundary entropy={entropy} />

            <DecoderLabels lssi={lssi} />

            {/* 5. Multiverse Dashboard: INTERACTIVE Navigation */}
            <MultiverseStatus currentMode={viewMode || 'OPERATOR'} onNavigate={onNavigate} />

            {/* 6. Interaction Visualizer: Floating data streams */}
            <InteractionVisualizer interactions={interactions || []} />

            {/* 7. New Interactive Data Nodes */}
            <DataNodeSystem count={8} />
        </group>
    )
}

function DeepCodeBackground() {
    return (
        <mesh position={[0, 0, -80]}>
            <planeGeometry args={[300, 200]} />
            <meshBasicMaterial color="#000510" transparent opacity={0.9} />
            <Text position={[0, 0, 1]} fontSize={0.5} color="#003344" maxWidth={280} lineHeight={1.5} textAlign="justify" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">
                {Array(200).fill("01").map(b => Math.random() > 0.5 ? "1" : "0").join(" ")}
            </Text>
        </mesh>
    )
}

function NeuralDataGrid() {
    const linesRef = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (linesRef.current) {
            linesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })
    return (
        <group ref={linesRef}>
            {Array.from({ length: 12 }).map((_, i) => (
                <line key={i} rotation={[0, (i / 12) * Math.PI * 2, 0]}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, -50, 0, 0, 50, 0])} itemSize={3} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#0044aa" transparent opacity={0.2} />
                </line>
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
                <mesh key={`ring-${i}`} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[10 + i * 10, 10 + i * 10 + 0.2, 64]} />
                    <meshBasicMaterial color="#0044aa" transparent opacity={0.1} side={THREE.DoubleSide} />
                </mesh>
            ))}
        </group>
    )
}

function DataNodeSystem({ count }: { count: number }) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <DataNode key={i} position={[
                    Math.sin(i / count * Math.PI * 2) * 40,
                    Math.cos(i / count * Math.PI * 4) * 20,
                    Math.cos(i / count * Math.PI * 2) * 40
                ]} />
            ))}
        </group>
    )
}

function DataNode({ position }: { position: number[] }) {
    const [hovered, set] = React.useState(false)
    const [active, setActive] = React.useState(false)

    // Setup random timer for decrypt effect instead of useFrame state thrash
    React.useEffect(() => {
        if (!active) return
        const timeout = setTimeout(() => setActive(false), 2000 + Math.random() * 2000)
        return () => clearTimeout(timeout)
    }, [active])

    return (
        <group position={new THREE.Vector3(...position)}>
            <mesh
                onPointerOver={() => set(true)}
                onPointerOut={() => set(false)}
                onClick={() => setActive(true)}
                scale={hovered ? 1.5 : 1}
            >
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color={active ? "#ff00ff" : (hovered ? "#00ffff" : "#0088aa")} wireframe={!active} />
            </mesh>
            {hovered && (
                <Billboard position={[0, 3, 0]}>
                    <Text fontSize={1.5} color="#00ffff" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">
                        {active ? "DECRYPTING..." : "DATA_NODE_LOCKED"}
                    </Text>
                </Billboard>
            )}
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
            <planeGeometry args={[200, 200, 64, 64]} />
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


function MultiverseStatus({ currentMode, onNavigate }: { currentMode: string, onNavigate?: (mode: any) => void }) {
    const modes = ['OPERATOR', 'GRAND_UNIFIED', 'WORMHOLE', 'STRING_THEORY', 'BINARY', 'QUANTUM', 'COSMIC_WEB', 'GENESIS', 'SINGULARITY', 'FREQUENCY', 'MATRIX']

    return (
        <group position={[-50, 0, -30]}>
            <Text position={[0, 15, 0]} fontSize={1.5} color="#00ffff" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">MULTIVERSE_SYNC_STATUS</Text>
            {modes.map((mode, i) => (
                <group key={mode} position={[0, 10 - i * 3.5, 0]}>
                    <InteractiveButton
                        label={mode}
                        active={mode === currentMode}
                        onClick={() => onNavigate && onNavigate(mode)}
                    />
                </group>
            ))}
        </group>
    )
}

function InteractiveButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    const [hovered, set] = React.useState(false)
    return (
        <group onClick={onClick} onPointerOver={() => set(true)} onPointerOut={() => set(false)}>
            <mesh position={[-2, 0, 0]}>
                <circleGeometry args={[0.8, 16]} />
                <meshBasicMaterial
                    color={active ? "#00ff00" : (hovered ? "#00ffff" : "#ffffff")}
                    transparent={true}
                    opacity={active || hovered ? 1 : 0.2}
                />
            </mesh>
            <Text position={[8, 0, 0]} fontSize={1.2} color={active ? "#00ff00" : (hovered ? "#00ffff" : "#cccccc")} textAlign="left" font="https://fonts.gstatic.com/s/roboto/v18/KFOlCnqEu92Fr1MmWUlfBBc4.woff">
                {label} {active ? '>> ACTIVE' : (hovered ? '>> WARP' : '>> STANDBY')}
            </Text>
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
