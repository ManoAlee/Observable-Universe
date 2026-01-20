import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, Sphere, Line, Html, MeshTransmissionMaterial, MeshDistortMaterial, MeshWobbleMaterial, CameraShake } from '@react-three/drei'
import * as THREE from 'three'
import { THEORY_FACTIONS, TheoryAgent, FORBIDDEN_AGENT } from '../data/TheoryAgents'

export default function EpistemicWarUniverse({ onNavigate }: { onNavigate: (mode: any) => void }) {
    const [selectedFaction, setSelectedFaction] = useState<TheoryAgent | null>(null)
    const [shakeIntensity, setShakeIntensity] = useState(0)
    const [collapseTrigger, setCollapseTrigger] = useState(0)

    const agents = useMemo(() => THEORY_FACTIONS, [])

    const handleCollapse = () => {
        if (!selectedFaction) return
        setShakeIntensity(2)
        setCollapseTrigger(Date.now())
        setTimeout(() => setShakeIntensity(0), 500)
        console.log(`[COLLAPSE] Observing ${selectedFaction.name}. Wave function collapsing...`)
    }

    return (
        <group>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <Starfield />

            <CameraShake
                maxYaw={0.05 * shakeIntensity}
                maxPitch={0.05 * shakeIntensity}
                maxRoll={0.05 * shakeIntensity}
                yawFrequency={10}
                pitchFrequency={10}
                rollFrequency={10}
                intensity={shakeIntensity}
                decay={true}
                decayRate={0.65}
            />

            {collapseTrigger > 0 && <Shockwave key={collapseTrigger} />}

            {agents.map((agent, i) => {
                const angle = (i / agents.length) * Math.PI * 2
                const radius = 15
                return (
                    <FactionNode
                        key={agent.id}
                        faction={agent}
                        position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
                        onClick={() => setSelectedFaction(agent)}
                        isSelected={selectedFaction?.id === agent.id}
                    />
                )
            })}

            <WarConnections factions={agents} />

            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', bottom: '50px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '20px', pointerEvents: 'auto' }}>
                    <button
                        onClick={() => onNavigate('OPERATOR')}
                        style={{
                            background: 'rgba(0,0,0,0.8)', color: '#00ffff', border: '1px solid #00ffff',
                            padding: '10px 30px', fontFamily: 'monospace', cursor: 'pointer',
                            fontSize: '16px', letterSpacing: '2px', backdropFilter: 'blur(5px)'
                        }}>
                        OPERATOR
                    </button>

                    {selectedFaction && (
                        <button
                            onClick={handleCollapse}
                            style={{
                                background: 'rgba(255, 0, 0, 0.2)', color: '#ff0055', border: '1px solid #ff0055',
                                padding: '10px 30px', fontFamily: 'monospace', cursor: 'pointer',
                                fontSize: '16px', letterSpacing: '2px', backdropFilter: 'blur(5px)',
                                boxShadow: '0 0 20px rgba(255, 0, 85, 0.5)'
                            }}>
                            VALIDATE REALITY
                        </button>
                    )}
                </div>

                {selectedFaction && (
                    <div style={{
                        position: 'absolute', top: '100px', right: '50px', width: '300px',
                        background: 'rgba(5, 5, 10, 0.9)', border: `1px solid ${selectedFaction.color}`,
                        padding: '20px', fontFamily: 'monospace', color: 'white'
                    }}>
                        <h2 style={{ margin: '0 0 10px 0', color: selectedFaction.color }}>{selectedFaction.name}</h2>
                        <div style={{ fontSize: '12px', color: '#888' }}>ID: {selectedFaction.id}</div>
                        <div style={{ marginTop: '15px', fontSize: '14px', lineHeight: '1.4' }}>
                            <div><strong>Scientific Status:</strong> {selectedFaction.scientificStatus}</div>
                            <div style={{ marginTop: '5px' }}><strong>Real World Limit:</strong> {selectedFaction.realLimit}</div>
                            <div style={{ marginTop: '5px', color: '#ffaa00' }}><strong>Collapse Chance:</strong> {(selectedFaction.collapseChance * 100).toFixed(0)}%</div>
                        </div>
                    </div>
                )}
            </Html>
        </group>
    )
}

function Shockwave() {
    const mesh = useRef<THREE.Mesh>(null)
    useFrame((state, delta) => {
        if (mesh.current) {
            mesh.current.scale.addScalar(delta * 50)
            if (mesh.current.material instanceof THREE.Material) {
                mesh.current.material.opacity = Math.max(0, mesh.current.material.opacity - delta * 2)
            }
        }
    })
    return (
        <mesh ref={mesh}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial color="white" transparent opacity={0.8} side={THREE.BackSide} />
        </mesh>
    )
}

// Real-world equations for scientific validation
const REAL_EQUATIONS: Record<string, string> = {
    'FISICA': 'G_uv + Λg_uv = (8πG/c^4)T_uv', // General Relativity
    'VIDA': 'ΔG = ΔH - TΔS < 0', // Gibbs Free Energy (Life condition)
    'CONSCIENCIA': 'Φ = Σ P log P', // IIT (Integrated Information)
    'IA_FUTURO': 'E[U] = Σ P(o|a)U(o)', // Expected Utility (AGI)
    'META_REALIDADE': 'R_u = Σ 2^-l(p)' // Algorithmic Probability
}

function FactionNode({ faction, position, onClick, isSelected }: { faction: TheoryAgent, position: [number, number, number], onClick: () => void, isSelected: boolean }) {
    const mesh = useRef<THREE.Group>(null)
    const [hovered, setHover] = useState(false)

    useFrame((state) => {
        if (!mesh.current) return
        const scale = 1 + (faction.strength / 100) + Math.sin(state.clock.elapsedTime * 2) * 0.1
        mesh.current.scale.setScalar(scale)
        mesh.current.rotation.y += 0.01 * (faction.strength / 50)
    })

    return (
        <group position={new THREE.Vector3(...position)} onClick={(e) => { e.stopPropagation(); onClick() }} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
            <group ref={mesh}>
                <NodeVisuals type={faction.id} intensity={1 + (faction.strength / 50)} />
            </group>

            <mesh visible={hovered || isSelected} scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[1.8, 16, 16]} />
                <meshBasicMaterial color={faction.color} transparent opacity={0.1} wireframe />
            </mesh>

            <Billboard position={[0, 4, 0]}>
                <Text fontSize={1} color={faction.color} outlineWidth={0.05} outlineColor="black">
                    {faction.id}
                </Text>

                {/* Scientific Validation: Real Equations Hologram */}
                {(hovered || isSelected) && (
                    <group position={[0, -1.8, 0]}>
                        <Text fontSize={0.4} color="white" anchorY="top" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                            {REAL_EQUATIONS[faction.id] || "E = mc^2"}
                        </Text>
                        <Text position={[0, -0.6, 0]} fontSize={0.25} color="#aaaaaa" anchorY="top" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                            [VALIDATED_PARAMETER]
                        </Text>
                    </group>
                )}
            </Billboard>
        </group>
    )
}

function WarConnections({ factions }: { factions: TheoryAgent[] }) {
    const connections = useMemo(() => {
        const lines = []
        for (let i = 0; i < factions.length; i++) {
            for (let j = i + 1; j < factions.length; j++) {
                const angle1 = (i / factions.length) * Math.PI * 2
                const p1 = new THREE.Vector3(Math.cos(angle1) * 15, 0, Math.sin(angle1) * 15)
                const angle2 = (j / factions.length) * Math.PI * 2
                const p2 = new THREE.Vector3(Math.cos(angle2) * 15, 0, Math.sin(angle2) * 15)
                lines.push({ start: p1, end: p2 })
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
                    opacity={0.05}
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

function NodeVisuals({ type, intensity }: { type: string, intensity: number }) {
    switch (type) {
        case 'FISICA': return <InvisibleVisual intensity={intensity} />
        case 'VIDA': return <MultiverseVisual intensity={intensity} />
        case 'CONSCIENCIA': return <ConsciousnessVisual intensity={intensity} />
        case 'IA_FUTURO': return <MachinesVisual intensity={intensity} />
        case 'META_REALIDADE': return <UnknownVisual intensity={intensity} />
        default: return (
            <Sphere args={[1.5, 16, 16]}>
                <meshStandardMaterial color="white" wireframe />
            </Sphere>
        )
    }
}

function MultiverseVisual({ intensity }: { intensity: number }) {
    const group = useRef<THREE.Group>(null)
    const count = 6
    const bubbles = useMemo(() => new Array(count).fill(0).map(() => ({
        pos: new THREE.Vector3((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4),
        scale: 0.5 + Math.random() * 0.5,
        speed: 0.2 + Math.random() * 0.5
    })), [])

    useFrame((state) => {
        if (!group.current) return
        group.current.rotation.y += 0.002 * intensity
        group.current.children.forEach((child, i) => {
            if (bubbles[i]) {
                child.position.y += Math.sin(state.clock.elapsedTime * bubbles[i].speed) * 0.005
            }
        })
    })

    return (
        <group ref={group}>
            {bubbles.map((b, i) => (
                <mesh key={i} position={b.pos} scale={[b.scale, b.scale, b.scale]}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <MeshDistortMaterial
                        color="#00ff88"
                        emissive="#00ff88"
                        emissiveIntensity={0.2 * intensity}
                        roughness={0.1}
                        metalness={0.1}
                        distort={0.4}
                        speed={2}
                        transparent
                        opacity={0.8}
                    />
                </mesh>
            ))}
            <pointLight distance={5} intensity={2} color="#00ff88" />
        </group>
    )
}

function ConsciousnessVisual({ intensity }: { intensity: number }) {
    const mesh = useRef<THREE.Mesh>(null)
    return (
        <mesh ref={mesh}>
            <torusKnotGeometry args={[0.8, 0.25, 128, 32]} />
            <MeshWobbleMaterial
                color="#ff00ff"
                emissive="#aa00ff"
                emissiveIntensity={0.5 * intensity}
                factor={0.6}
                speed={1.5}
                roughness={0}
                metalness={0.5}
            />
        </mesh>
    )
}

function MachinesVisual({ intensity }: { intensity: number }) {
    const group = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.5
            group.current.rotation.y += 0.01 * intensity
        }
    })
    return (
        <group ref={group}>
            <mesh>
                <boxGeometry args={[1.2, 1.2, 1.2]} />
                <meshPhysicalMaterial
                    color="#ffaa00"
                    emissive="#ff4400"
                    emissiveIntensity={2 * intensity}
                    roughness={0.2}
                    metalness={1}
                    wireframe={false}
                />
            </mesh>
            <mesh rotation={[0.5, 0.5, 0]}>
                <boxGeometry args={[1.8, 1.8, 1.8]} />
                <meshStandardMaterial color="#ffaa00" wireframe transparent opacity={0.3} />
            </mesh>
        </group>
    )
}

function InvisibleVisual({ intensity }: { intensity: number }) {
    return (
        <group>
            <mesh>
                <sphereGeometry args={[1.4, 64, 64]} />
                <MeshTransmissionMaterial
                    backside
                    backsideThickness={5}
                    thickness={2}
                    chromaticAberration={0.5}
                    anisotropy={0.5}
                    distortion={0.5}
                    distortionScale={0.5}
                    temporalDistortion={0.5}
                    ior={1.5}
                    color="#5500ff"
                    attenuationColor="#ffffff"
                    attenuationDistance={5}
                />
            </mesh>
        </group>
    )
}

function UnknownVisual({ intensity }: { intensity: number }) {
    return (
        <group>
            <mesh>
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshStandardMaterial color="black" roughness={0} metalness={1} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[1.5, 2.5, 64]} />
                <meshBasicMaterial
                    color="#ffffff"
                    side={THREE.DoubleSide}
                    transparent
                    opacity={0.2}
                />
            </mesh>
            <mesh>
                <torusGeometry args={[2, 0.05, 16, 100]} />
                <meshBasicMaterial color="#00ff00" transparent opacity={0.5 * intensity} />
            </mesh>
        </group>
    )
}
