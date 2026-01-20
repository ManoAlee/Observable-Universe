import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'

interface NeuralSymbiosisProps {
    observer: THREE.Vector2
    intensity: number
}

export default function NeuralSymbiosis({ observer, intensity }: NeuralSymbiosisProps) {
    const initialCount = 2000
    const pointsRef = useRef<THREE.Points>(null)
    const linesRef = useRef<THREE.LineSegments>(null)

    // State for our autonomous neural agents
    // We keep them in a ref to modify without re-rendering, 
    // but we need to update the geometry attributes every frame.
    const agents = useRef(Array.from({ length: initialCount }).map((_, i) => ({
        id: i,
        pos: new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100),
        vel: new THREE.Vector3(),
        intent: Math.random(), // 0.0 to 1.0 "Concept ID"
        active: true,
        mass: 1.0, // Mass increases with fusion
        fusionTime: -10.0
    })))

    // Geometry Refs (for manual attribute updates)
    const positionsRef = useRef(new Float32Array(initialCount * 3))
    const colorsRef = useRef(new Float32Array(initialCount * 3))
    const connectionsRef = useRef(new Float32Array(initialCount * 3 * 2)) // buffer for lines

    useFrame((state) => {
        const t = state.clock.getElapsedTime()

        // 1. UPDATE AGENTS (The Physics of Intent)
        const activeAgents = agents.current.filter(a => a.active)

        // Optimization: Spatial partitioning would be better, but O(N^2) for 2000 is too slow in JS.
        // We will sample random neighbors for interaction to keep > 30 FPS.

        activeAgents.forEach(a => {
            // "Intentional Gravity" towards the Observer (The User)
            // The user represents the "Universal Constant" or "Attractor of Meaning"
            const obsPos = new THREE.Vector3(observer.x * 50, observer.y * 50, 0)
            const toObs = new THREE.Vector3().subVectors(obsPos, a.pos)
            const distToObs = toObs.length()

            // Interaction Field Pull
            a.vel.add(toObs.normalize().multiplyScalar(0.05 / (distToObs + 1)))

            // Random Neighbor Interaction (simplified gravity)
            // sample 5 random peers
            for (let k = 0; k < 5; k++) {
                const neighbor = activeAgents[Math.floor(Math.random() * activeAgents.length)]
                if (neighbor === a) continue;

                // Intentional Gravity Logic inline (optimized)
                const diff = new THREE.Vector3().subVectors(neighbor.pos, a.pos)
                const dist = diff.length()
                const similarity = 1.0 - Math.abs(a.intent - neighbor.intent)

                if (similarity > 0.8) {
                    // Attraction (Like attracts Like)
                    a.vel.add(diff.normalize().multiplyScalar(0.02 * similarity))

                    // FUSION CHECK (1 + 1 = 1)
                    if (dist < 1.0 && a.mass < 5.0 && neighbor.mass < 5.0) {
                        // Merge!
                        // We absorb the neighbor into 'a'
                        a.mass += neighbor.mass
                        a.fusionTime = t
                        a.pos.lerp(neighbor.pos, 0.5)
                        // Kill the neighbor
                        neighbor.active = false
                    }
                }
            }

            // Apply Velocity & Drag
            a.vel.multiplyScalar(0.96) // Drag
            a.pos.add(a.vel)

            // Boundary wrap
            if (a.pos.length() > 60) a.pos.multiplyScalar(0.95)
        })

        // 2. UPDATE GEOMETRY
        let ptr = 0
        let colPtr = 0

        agents.current.forEach((a, i) => {
            if (!a.active) {
                // Hide inactive agents
                positionsRef.current[i * 3] = 99999
                positionsRef.current[i * 3 + 1] = 99999
                positionsRef.current[i * 3 + 2] = 99999
                return
            }

            positionsRef.current[i * 3] = a.pos.x
            positionsRef.current[i * 3 + 1] = a.pos.y
            positionsRef.current[i * 3 + 2] = a.pos.z

            // Visuals: Mass = Brightness/Color
            const brightness = 0.5 + a.mass * 0.2

            // Fusion Flash Calculation
            const timeSinceFusion = t - a.fusionTime
            const flash = Math.max(0, 1.0 - timeSinceFusion * 2.0) // 0.5s flash duration

            colorsRef.current[i * 3] = Math.min(1, (0.1 * brightness) + flash)
            colorsRef.current[i * 3 + 1] = Math.min(1, (0.8 * brightness) + flash)
            colorsRef.current[i * 3 + 2] = Math.min(1, (1.0 * brightness) + flash)
        })

        if (pointsRef.current) {
            pointsRef.current.geometry.attributes.position.needsUpdate = true
            pointsRef.current.geometry.attributes.color.needsUpdate = true
        }

    })

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={initialCount} array={positionsRef.current} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={initialCount} array={colorsRef.current} itemSize={3} />
                </bufferGeometry>
                <PointMaterial size={0.5} vertexColors transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
            </points>

            {/* NEW: Augmented Reality Data Overlay */}
            <NeuralOverlay agents={agents.current} />
        </group>
    )
}

function NeuralOverlay({ agents }: { agents: any[] }) {
    // Select a few "Monitor Nodes" to display AR stats
    const monitors = useMemo(() => {
        return [100, 500, 1000, 1500].map(id => agents[id]).filter(a => a);
    }, [agents]);

    return (
        <group>
            {monitors.map((agent, i) => (
                <ARLabel key={i} agent={agent} index={i} />
            ))}
        </group>
    );
}

function ARLabel({ agent, index }: { agent: any, index: number }) {
    const groupRef = useRef<THREE.Group>(null);
    const textRef = useRef<any>(null);

    useFrame((state) => {
        if (groupRef.current && agent.active) {
            // Track the agent
            groupRef.current.position.copy(agent.pos);
            groupRef.current.position.y += 2; // Float above

            // Simulate "Scanning" data update
            if (textRef.current && Math.random() > 0.95) {
                const charge = (agent.mass * 100).toFixed(0);
                const vel = (agent.vel.length() * 1000).toFixed(0);
                textRef.current.text = `ID_${index} // CHARGE: ${charge}mV\nVELOCITY: ${vel}m/s`;
            }
        }
    });

    if (!agent.active) return null;

    return (
        <group ref={groupRef}>
            {/* Connection Line */}
            <mesh position={[0, -1, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 2]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.5} />
            </mesh>

            {/* Holographic Panel */}
            <Billboard>
                <mesh position={[0, 0, -0.05]}>
                    <planeGeometry args={[8, 3]} />
                    <meshBasicMaterial color="#000033" transparent opacity={0.7} />
                    <lineSegments>
                        <edgesGeometry args={[new THREE.PlaneGeometry(8, 3)]} />
                        <lineBasicMaterial color="#00ffff" transparent opacity={0.5} />
                    </lineSegments>
                </mesh>
                <Text
                    ref={textRef}
                    fontSize={0.6}
                    color="#00ffff"
                    font="/fonts/Roboto-VariableFont_wdth,wght.ttf"
                    anchorX="center"
                    anchorY="middle"
                >
                    {`ID_${index} // SYNCHRONIZING...`}
                </Text>
            </Billboard>
        </group>
    );
}
