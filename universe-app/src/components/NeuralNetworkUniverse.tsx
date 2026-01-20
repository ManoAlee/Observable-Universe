import React, { useMemo, useRef, useState, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber'
import { Text, Float, Html, Billboard } from '@react-three/drei'
import * as THREE from 'three'

import { LSSIData } from '../services/universeDecoder'

interface NeuralNetworkUniverseProps {
    observer: THREE.Vector2
    entropy: number
    lssiData?: LSSIData | null
}

// Node Health States
type NodeState = 'HEALTHY' | 'INFECTED' | 'ZOMBIE'

export default function NeuralNetworkUniverse({ observer, entropy, lssiData }: NeuralNetworkUniverseProps) {
    // Determine Global System Integrity based on LSSI
    const systemIntegrity = Math.max(0, 100 - (lssiData?.lssi || 0) * 100)
    const integrityColor = systemIntegrity > 80 ? '#00ff88' : systemIntegrity > 50 ? '#ffff00' : '#ff0000'

    return (
        <group>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />

            {/* Fog for Depth */}
            <fog attach="fog" args={['#000510', 20, 120]} />

            <CarbonCivilization lssiData={lssiData} integrityColor={integrityColor} />

            {/* HUD / System Monitor Label - SUPER FRONT UPGRADE */}
            <Html fullscreen style={{ pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute',
                    top: '120px',
                    right: '20px',
                    padding: '24px',
                    background: 'rgba(0, 5, 10, 0.85)',
                    backdropFilter: 'blur(20px)',
                    borderLeft: `4px solid ${integrityColor}`,
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: "'JetBrains Mono', monospace",
                    color: 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
                    width: '320px',
                    clipPath: 'polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%)'
                }}>
                    <div style={{ fontSize: '10px', color: '#00f2ff', letterSpacing: '4px', textTransform: 'uppercase' }}>NeuraLink // v9.0</div>
                    <div style={{ fontSize: '28px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>
                        CORTEX_OS
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
                        <span style={{ fontSize: '12px', opacity: 0.6 }}>SYSTEM_INTEGRITY</span>
                        <span style={{ fontSize: '24px', fontWeight: 'bold', color: integrityColor }}>{systemIntegrity.toFixed(1)}%</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
                        <MetricBox label="SOLAR_KP" value={lssiData?.solarKp?.toFixed(1) || '0.0'} unit="idx" color="#ff4400" />
                        <MetricBox label="EARTH_MAG" value={lssiData?.earthMag?.toFixed(1) || '0.0'} unit="M" color="#ff0055" />
                        <MetricBox label="NEO_DIST" value={lssiData?.neoDist?.toFixed(1) || '0.0'} unit="LD" color="#00ffee" />
                        <MetricBox label="COHERENCE" value={lssiData?.coherence?.toFixed(2) || '0.0'} unit="Ψ" color="#aa00ff" />
                    </div>

                    <div style={{ fontSize: '10px', color: '#444', marginTop: '10px', textAlign: 'center' }}>
                        Waiting for neural handshake...
                    </div>
                </div>
            </Html>
        </group>
    )
}

function MetricBox({ label, value, unit, color }: { label: string, value: string, unit: string, color: string }) {
    return (
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: '8px', opacity: 0.5, marginBottom: '4px', letterSpacing: '1px' }}>{label}</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: color }}>{value}<span style={{ fontSize: '10px', marginLeft: '2px', opacity: 0.7, color: 'white' }}>{unit}</span></div>
        </div>
    )
}

function CarbonCivilization({ lssiData, integrityColor }: { lssiData: LSSIData | null | undefined, integrityColor: string }) {
    // Pulse speed = Processing Cycle Speed
    const processingSpeed = 1.0 + (lssiData?.lssi || 0) * 8.0

    return (
        <group>
            {/* BRAIN ANATOMY: Compacted Clusters */}

            {/* FRONT LOBE (Logic / Future Planning) */}
            <CivilizationSector
                count={150} position={[0, 5, 20]} radius={15}
                baseColor="#00aaff"
                label="FRONT_LOBE // LOGIC"
                infectionRate={(lssiData?.lssi || 0)}
                pulseSpeed={processingSpeed}
            />

            {/* PARIETAL (Coordination / Sync) */}
            <CivilizationSector
                count={150} position={[0, 15, 0]} radius={12}
                baseColor="#aa00ff"
                label="PARIETAL // SYNC"
                infectionRate={(lssiData?.lssi || 0) * 0.5}
                pulseSpeed={processingSpeed * 1.1}
            />

            {/* OCCIPITAL (Sensory / Vision) */}
            <CivilizationSector
                count={150} position={[0, 5, -20]} radius={12}
                baseColor="#ff00aa"
                label="OCCIPITAL // SENSES"
                infectionRate={(lssiData?.lssi || 0) * 0.8}
                pulseSpeed={processingSpeed * 0.9}
            />

            {/* TEMPORAL SIDES (Memory / Speech) */}
            <CivilizationSector
                count={100} position={[15, 0, 0]} radius={10}
                baseColor="#00ffee"
                label="TEMPORAL_R"
                infectionRate={0}
                pulseSpeed={processingSpeed}
            />
            <CivilizationSector
                count={100} position={[-15, 0, 0]} radius={10}
                baseColor="#00ffee"
                label="TEMPORAL_L"
                infectionRate={0}
                pulseSpeed={processingSpeed}
            />

            {/* CENTRAL NUCLEUS (Vital OS) */}
            <CivilizationSector
                count={80} position={[0, -5, 0]} radius={6}
                baseColor={integrityColor}
                label="CORTEX_STEM"
                subLabel={`Integrity: ${(100 - (lssiData?.lssi || 0) * 100).toFixed(0)}%`}
                infectionRate={0}
                pulseSpeed={2}
            />

            {/* SYNAPTIC DATA HIGHWAYS (Inter-Lobe Connections) */}
            <DataHighways from={[0, 5, 20]} to={[0, 15, 0]} speed={processingSpeed} color="#ffffff" count={100} />
            <DataHighways from={[0, 15, 0]} to={[0, 5, -20]} speed={processingSpeed} color="#aa00ff" count={100} />
            <DataHighways from={[15, 0, 0]} to={[0, -5, 0]} speed={processingSpeed} color="#00ffff" count={50} />
            <DataHighways from={[-15, 0, 0]} to={[0, -5, 0]} speed={processingSpeed} color="#00ffff" count={50} />
        </group>
    )
}


function CivilizationSector({ count, position, radius, baseColor, label, subLabel, infectionRate, pulseSpeed = 1 }: { count: number, position: [number, number, number], radius: number, baseColor: string, label?: string, subLabel?: string, infectionRate: number, pulseSpeed?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const colorHelper = useMemo(() => new THREE.Color(), [])

    // Initialize Citizen States
    const [nodeStates, setNodeStates] = useState<NodeState[]>(() =>
        new Array(count).fill('HEALTHY').map(() => Math.random() < 0.1 ? 'ZOMBIE' : 'HEALTHY')
    )

    // Initial Positions (Spherical / Brain-like)
    const nodes = useMemo(() => {
        const n = []
        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count)
            const theta = Math.sqrt(count * Math.PI) * phi

            n.push({
                x: Math.cos(theta) * Math.sin(phi) * radius,
                y: Math.sin(theta) * Math.sin(phi) * radius,
                z: Math.cos(phi) * radius,
                speed: 0.2 + Math.random() * 0.8,
                phase: Math.random() * Math.PI * 2,
                baseRadius: radius
            })
        }
        return n
    }, [count, radius])


    const [pulses, setPulses] = useState<{ id: number, position: THREE.Vector3 }[]>([])

    // Handle Infection Spread & Recovery
    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime

        // Randomly infect nodes based on infectionRate
        if (Math.random() < 0.01) { // 1% chance per frame to check for new infection
            const victimIdx = Math.floor(Math.random() * count)
            if (nodeStates[victimIdx] === 'HEALTHY' && Math.random() < infectionRate * 0.1) {
                const newStates = [...nodeStates]
                newStates[victimIdx] = 'INFECTED'
                setNodeStates(newStates)
            }
        }

        nodes.forEach((pos, i) => {
            const nodeState = nodeStates[i]

            // Movement Logic (Subtle brain throb)
            const speed = pos.speed * pulseSpeed
            const throb = 1.0 + Math.sin(t * speed + pos.phase) * 0.05

            let posX = position[0] + pos.x * throb
            let posY = position[1] + pos.y * throb
            let posZ = position[2] + pos.z * throb
            let scale = 1.0

            // State-Specific Behavior
            if (nodeState === 'INFECTED') {
                // Glitch / Shaking
                posX += (Math.random() - 0.5) * 0.5
                posY += (Math.random() - 0.5) * 0.5
                posZ += (Math.random() - 0.5) * 0.5
                colorHelper.set('#ff0033')
                scale = 1.5
            } else if (nodeState === 'ZOMBIE') {
                scale = 0.5
                colorHelper.set('#333333')
            } else {
                scale = 1 + Math.sin(t * pulseSpeed * 2 + i) * 0.2
                const hue = new THREE.Color(baseColor).getHSL({ h: 0, s: 0, l: 0 }).h
                colorHelper.setHSL(hue, 1, 0.5 + Math.sin(t * pulseSpeed + i) * 0.2)
            }

            dummy.position.set(posX, posY, posZ)
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
            meshRef.current!.setColorAt(i, colorHelper)
        })


        meshRef.current.instanceMatrix.needsUpdate = true
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    })

    const handleDebug = useCallback((e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation()
        const instanceId = e.instanceId
        if (typeof instanceId === 'number') {
            setPulses(prev => [...prev, { id: Date.now(), position: e.point.clone() }])
            setTimeout(() => setPulses(prev => prev.slice(1)), 1000) // Cleanup after 1s

            if (nodeStates[instanceId] === 'INFECTED') {
                const newStates = [...nodeStates]
                newStates[instanceId] = 'HEALTHY' // Patch applied
                setNodeStates(newStates)
            }
        }
    }, [nodeStates])

    const material = useMemo(() => new THREE.MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.1,
        metalness: 0.8,
        transmission: 0.1,
        thickness: 1.0,
        emissiveIntensity: 5.0,
        toneMapped: false
    }), [])

    return (
        <group>
            {pulses.map(p => <PulseEffect key={p.id} position={p.position} color={baseColor} />)}

            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, count]}
                onClick={handleDebug}
                onPointerOver={() => document.body.style.cursor = 'crosshair'}
                onPointerOut={() => document.body.style.cursor = 'default'}
            >
                <icosahedronGeometry args={[0.6, 1]} />
                <primitive object={material} attach="material" />
            </instancedMesh>

            {label && (
                <Billboard position={[position[0], position[1] + radius + 5, position[2]]}>
                    <Text fontSize={2.5} color={baseColor} anchorY="bottom" font="/fonts/static/Roboto-Bold.ttf">
                        {label}
                    </Text>
                    {subLabel && (
                        <Text position={[0, -2, 0]} fontSize={1.2} color="#ffffff" anchorY="top" font="/fonts/static/Roboto-Regular.ttf">
                            {subLabel}
                        </Text>
                    )}
                </Billboard>
            )}

        </group>
    )
}

function PulseEffect({ position, color }: { position: THREE.Vector3, color: string }) {
    const ref = useRef<THREE.Mesh>(null)
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.scale.addScalar(delta * 15)
            const mat = ref.current.material as THREE.MeshBasicMaterial
            mat.opacity -= delta * 2.5
        }
    })
    return (
        <mesh position={position} ref={ref}>
            <ringGeometry args={[0.5, 1, 32]} />
            <meshBasicMaterial color={color} transparent opacity={1} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
    )
}

function DataHighways({ from, to, speed, color, count }: { from: [number, number, number], to: [number, number, number], speed: number, color: string, count: number }) {
    const linesRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    const packets = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            offset: Math.random(),
            speed: 0.5 + Math.random(),
            randomOffset: new THREE.Vector3((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)
        }))
    }, [count])

    useFrame((state) => {
        if (!linesRef.current) return
        const t = state.clock.elapsedTime

        packets.forEach((p, i) => {
            const progress = (t * p.speed * speed * 0.2 + p.offset) % 1.0

            const curPos = new THREE.Vector3().lerpVectors(
                new THREE.Vector3(...from).add(p.randomOffset),
                new THREE.Vector3(...to).add(p.randomOffset),
                progress
            )

            dummy.position.copy(curPos)
            dummy.scale.set(1.0 * speed, 0.1, 0.1)
            dummy.lookAt(new THREE.Vector3(...to).add(p.randomOffset))
            dummy.updateMatrix()
            linesRef.current!.setMatrixAt(i, dummy.matrix)
        })
        linesRef.current.instanceMatrix.needsUpdate = true
    })


    return (
        <instancedMesh ref={linesRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    )
}
