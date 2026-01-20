import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, Sphere, Line } from '@react-three/drei'
import * as THREE from 'three'
import { THEORY_FACTIONS, TheoryAgent, FORBIDDEN_AGENT } from '../data/TheoryAgents'

export default function EpistemicWarUniverse() {
    const [factions, setFactions] = useState(THEORY_FACTIONS)
    const [selectedFaction, setSelectedFaction] = useState<TheoryAgent | null>(null)
    const [warLogs, setWarLogs] = useState<string[]>([
        "INICIANDO GUERRA EPISTÊMICA...",
        "CARREGANDO AGENTES...",
        "DETECTANDO OBSERVADOR HUMANO..."
    ])

    // Interaction Logic: "Collapsing" the wave function
    const handleCollapse = (factionId: string) => {
        setFactions(prev => prev.map(f => {
            if (f.id === factionId) {
                return { ...f, strength: Math.min(100, f.strength + 5) }
            } else {
                // Strengthening one weakens others slightly
                return { ...f, strength: Math.max(0, f.strength - 1) }
            }
        }))
        const fName = factions.find(f => f.id === factionId)?.name
        setWarLogs(prev => [`OBSERVADOR COLAPSOU EM: ${fName}`, ...prev.slice(0, 5)])
    }

    return (
        <group>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />

            {/* The Battlefield */}
            <group>
                {factions.map((faction, i) => {
                    // Position them in a pentagon
                    const angle = (i / factions.length) * Math.PI * 2
                    const radius = 15
                    const x = Math.cos(angle) * radius
                    const z = Math.sin(angle) * radius

                    return (
                        <FactionNode
                            key={faction.id}
                            faction={faction}
                            position={[x, 0, z]}
                            onClick={() => {
                                setSelectedFaction(faction)
                                handleCollapse(faction.id)
                            }}
                            isSelected={selectedFaction?.id === faction.id}
                        />
                    )
                })}
            </group>

            {/* Connection Lines (The Debate) */}
            <WarConnections factions={factions} />

            {/* HUD */}
            <Billboard position={[0, 8, -25]}>
                <Text fontSize={2} color="white" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    A GUERRA EPISTÊMICA
                </Text>
                <Text position={[0, -1.5, 0]} fontSize={0.8} color="#aaaaaa" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    "Onde teorias lutam para se tornar reais"
                </Text>
            </Billboard>

            {/* Logs Console */}
            <Billboard position={[0, -12, -20]}>
                <group position={[-10, 0, 0]}>
                    <Text fontSize={0.8} color="#00ff00" anchorX="left">
                        &gt;&gt; LOGS DE BATALHA:
                    </Text>
                    {warLogs.map((log, i) => (
                        <Text key={i} position={[0, -(i + 1) * 1.2, 0]} fontSize={0.6} color="white" anchorX="left" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                            {`> ${log}`}
                        </Text>
                    ))}
                </group>
            </Billboard>

            {/* Selected Faction Detail */}
            {selectedFaction && (
                <Billboard position={[20, 0, -10]}>
                    <Text fontSize={1.5} color={selectedFaction.color} anchorX="right">
                        {selectedFaction.name}
                    </Text>
                    <Text position={[0, -2, 0]} fontSize={0.7} color="white" anchorX="right" maxWidth={15}>
                        {selectedFaction.behavior}
                    </Text>
                    <Text position={[0, -4, 0]} fontSize={0.7} color="#aaaaaa" anchorX="right" maxWidth={15}>
                        {`FRAQUEZA: ${selectedFaction.weakness}`}
                    </Text>
                    <Text position={[0, -6, 0]} fontSize={1} color={selectedFaction.color} anchorX="right">
                        {`DOMINÂNCIA: ${selectedFaction.strength}%`}
                    </Text>
                </Billboard>
            )}

            <Starfield />
        </group>
    )
}

function FactionNode({ faction, position, onClick, isSelected }: { faction: TheoryAgent, position: [number, number, number], onClick: () => void, isSelected: boolean }) {
    const mesh = useRef<THREE.Mesh>(null)
    const [hovered, setHover] = useState(false)

    useFrame((state) => {
        if (!mesh.current) return
        // Pulse based on strength
        const scale = 1 + (faction.strength / 100) + Math.sin(state.clock.elapsedTime * 2) * 0.1
        mesh.current.scale.setScalar(scale)
        mesh.current.rotation.y += 0.01 * (faction.strength / 50)
    })

    return (
        <group position={new THREE.Vector3(...position)} onClick={(e) => { e.stopPropagation(); onClick() }} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <mesh ref={mesh}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshStandardMaterial
                    color={faction.color}
                    emissive={faction.color}
                    emissiveIntensity={isSelected || hovered ? 2 : 0.5}
                    wireframe={true}
                />
            </mesh>
            {/* Core Sphere */}
            <mesh scale={[0.5, 0.5, 0.5]}>
                <sphereGeometry args={[2, 16, 16]} />
                <meshBasicMaterial color={faction.color} transparent opacity={0.3} />
            </mesh>

            <Billboard position={[0, 4, 0]}>
                <Text fontSize={1} color={faction.color} outlineWidth={0.05} outlineColor="black">
                    {faction.id}
                </Text>
                <Text position={[0, -0.8, 0]} fontSize={0.6} color="white">
                    {`${faction.strength}%`}
                </Text>
            </Billboard>
        </group>
    )
}

function WarConnections({ factions }: { factions: TheoryAgent[] }) {
    const connections = useMemo(() => {
        const lines = []
        for (let i = 0; i < factions.length; i++) {
            for (let j = i + 1; j < factions.length; j++) {
                // Calculate position same as in render
                const angle1 = (i / factions.length) * Math.PI * 2
                const p1 = new THREE.Vector3(Math.cos(angle1) * 15, 0, Math.sin(angle1) * 15)

                const angle2 = (j / factions.length) * Math.PI * 2
                const p2 = new THREE.Vector3(Math.cos(angle2) * 15, 0, Math.sin(angle2) * 15)

                lines.push({ start: p1, end: p2, color1: factions[i].color, color2: factions[j].color })
            }
        }
        return lines
    }, [factions])

    return (
        <group>
            {connections.map((line, i) => (
                <Line
                    key={i}
                    points={[line.start, line.end]}
                    color="white"
                    transparent
                    opacity={0.1}
                    lineWidth={1}
                />
            ))}
        </group>
    )
}

function Starfield() {
    const count = 1000
    const [positions] = useState(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 100
        return pos
    })
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.1} color="white" />
        </points>
    )
}
