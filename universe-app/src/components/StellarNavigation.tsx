import React, { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Line, Billboard } from '@react-three/drei'
import * as THREE from 'three'

interface StellarNavigationProps {
    currentMode: string
    onNavigate: (mode: any) => void
    fov?: number
}

// Coordinate System for the "Universe Stars"
const STAR_SYSTEMS = [
    { id: 'GRAND_UNIFIED', label: 'UNITY_PRIME', pos: [0, 0, 0], color: '#ffffff', type: 'BLACK_HOLE' },
    { id: 'WORMHOLE', label: 'SINGULARITY_GATE', pos: [15, 5, -5], color: '#ffaa00', type: 'ACCRETION' },
    { id: 'MATRIX', label: 'DIGITAL_NEXUS', pos: [-15, 8, -5], color: '#00ff00', type: 'CUBE' },
    { id: 'QUANTUM', label: 'PROBABILITY_CLOUD', pos: [10, -10, 5], color: '#00ffff', type: 'MIST' },
    { id: 'STRING_THEORY', label: 'VIBRATION_STRING', pos: [-10, -5, 10], color: '#ff00ff', type: 'RING' },
    { id: 'COSMIC_WEB', label: 'GALACTIC_FILAMENT', pos: [0, 15, -10], color: '#4444ff', type: 'WEB' },
    { id: 'DECODER', label: 'OBSERVER_STATION', pos: [0, -15, 15], color: '#ff3366', type: 'STATION' },
    { id: 'DARK_MATTER', label: 'SUBSPACE_VOID', pos: [20, 0, 10], color: '#4400cc', type: 'VOID' },
    { id: 'NEURAL_NETWORK', label: 'NEURAL_NEXUS', pos: [-20, 0, 10], color: '#00ffcc', type: 'BRAIN' },
    { id: 'BIOLOGIC', label: 'HELIX_PRIME', pos: [0, 20, 10], color: '#00ff88', type: 'HELIX' } // New Bio
]

export default function StellarNavigation({ currentMode, onNavigate }: StellarNavigationProps) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            // Gentle rotation of the entire galaxy map
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.05
        }
    })

    return (
        <group position={[0, -5, -20]} scale={[0.5, 0.5, 0.5]}>
            <group ref={groupRef}>
                {/* Subspace Connections (Lines between stars) */}
                <SubspaceGenerators />

                {/* The Star Systems */}
                {STAR_SYSTEMS.map((sys) => (
                    <StarSystem
                        key={sys.id}
                        {...sys}
                        active={currentMode === sys.id}
                        onClick={() => onNavigate(sys.id)}
                    />
                ))}
            </group>

            <Billboard position={[0, 20, 0]}>
                <Text fontSize={3} color="#ffffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    STELLAR_NAVIGATION_INTERFACE
                </Text>
                <Text position={[0, -2, 0]} fontSize={1.5} color="#888888" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    Click a System to Warp
                </Text>
            </Billboard>
        </group>
    )
}

function SubspaceGenerators() {
    // Draw lines connecting the central unity to others
    return (
        <group>
            {STAR_SYSTEMS.slice(1).map((sys, i) => (
                <Line
                    key={i}
                    points={[[0, 0, 0], sys.pos as [number, number, number]]}
                    color="#ffffff"
                    transparent
                    opacity={0.1}
                    lineWidth={1}
                />
            ))}
        </group>
    )
}

function StarSystem({ id, label, pos, color, type, active, onClick }: any) {
    const meshRef = useRef<THREE.Group>(null)
    const [hovered, setHover] = useState(false)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01
            // Pulse if active
            const scale = active ? 1.5 : (hovered ? 1.2 : 1.0)
            meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1)
        }
    })

    return (
        <group
            position={pos}
            ref={meshRef}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => setHover(true)}
            onPointerOut={() => setHover(false)}
        >
            {/* Visual Representation based on Type */}
            <SystemMesh type={type} color={color} active={active} />

            {/* Label */}
            <Billboard position={[0, 2.5, 0]}>
                <Text fontSize={1.5} color={active ? "#ffffff" : color} font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {label}
                </Text>
                {hovered && (
                    <Text position={[0, -1, 0]} fontSize={0.8} color="#cccccc" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                        [INITIATE_WARP]
                    </Text>
                )}
            </Billboard>

            {/* Selection Ring */}
            {active && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[2, 2.2, 32]} />
                    <meshBasicMaterial color={color} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    )
}

function SystemMesh({ type, color, active }: any) {
    const material = <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 2 : 0.5} wireframe={!active} />

    switch (type) {
        case 'BLACK_HOLE': return (<mesh>{material}<sphereGeometry args={[1.5, 32, 32]} /></mesh>)
        case 'CUBE': return (<mesh>{material}<boxGeometry args={[1.5, 1.5, 1.5]} /></mesh>)
        case 'RING': return (<mesh>{material}<torusGeometry args={[1, 0.3, 16, 32]} /></mesh>)
        case 'WEB': return (<mesh>{material}<dodecahedronGeometry args={[1.2]} /></mesh>)
        case 'VOID': return (<mesh>{material}<octahedronGeometry args={[1.2]} /></mesh>) // Dark Matter
        case 'BRAIN': return (<mesh>{material}<icosahedronGeometry args={[1.5, 1]} /></mesh>) // Neural Brain
        case 'HELIX': return (<mesh>{material}<capsuleGeometry args={[0.8, 3, 4, 8]} /></mesh>) // DNA
        default: return (<mesh>{material}<sphereGeometry args={[1, 16, 16]} /></mesh>)
    }
}
