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

    useFrame((state) => {
        if (active && Math.random() > 0.95) setActive(false)
    })

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

/* ... SpacetimeMetric, HiggsBIOS, PathIntegralVisualization, HolographicBoundary, DecoderLabels UNCHANGED ... */

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
