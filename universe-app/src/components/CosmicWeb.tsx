import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

interface CosmicWebProps {
    clusters?: any
    isDecoding?: boolean
    chaos?: number
}

// Real Supercluster Data (Approximate relative positions)
const SUPERCLUSTERS = [
    { name: "LANIAKEA", pos: [0, 0, 0], color: "#4488ff" },
    { name: "VIRGO", pos: [40, 20, -10], color: "#00ffff" },
    { name: "PERSEUS-PISCES", pos: [-50, 30, 20], color: "#ff00ff" },
    { name: "GREAT ATTRACTOR", pos: [20, -40, 10], color: "#ff4400" },
    { name: "COMA", pos: [-30, -50, -40], color: "#aa00aa" },
    { name: "SHAPLEY", pos: [60, -20, 50], color: "#00ff88" }
]

export default function CosmicWeb({ isDecoding = false, chaos = 0 }: CosmicWebProps) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            // Slow rotation of the entire universe
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.01 * (1 + chaos)
        }
    })

    return (
        <group ref={groupRef}>
            {/* Volumetric Filaments (The Skeleton) */}
            <FilamentNetwork chaos={chaos} />

            {/* Dark Matter Halo (The Glue) */}
            <DarkMatterHalo chaos={chaos} />

            {/* Named Superclusters (The Landmarks) */}
            {SUPERCLUSTERS.map((cluster, i) => (
                <SuperclusterMarker key={i} {...cluster} chaos={chaos} />
            ))}

            {/* Expansion Haze */}
            <mesh scale={[300, 300, 300]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#010103" side={THREE.BackSide} transparent opacity={0.6} />
            </mesh>

            {/* THE GREAT FILTER: Silent Void Zones */}
            <GreatFilterVoid />

            {/* THE ZOO: Hidden Watchers */}
            <ZooStealthShips chaos={chaos} />
        </group>
    )
}

function FilamentNetwork({ chaos }: { chaos: number }) {
    const linesRef = useRef<THREE.LineSegments>(null)
    const count = 1500 // Increased density for depth

    const { positions, colors } = useMemo(() => {
        const pos = []
        const col = []
        const clusterCenters = SUPERCLUSTERS.map(c => new THREE.Vector3(...c.pos as [number, number, number]))

        // Create filaments connecting superclusters
        for (let i = 0; i < count; i++) {
            // Pick two random clusters to connect
            const startIdx = Math.floor(Math.random() * clusterCenters.length)
            let endIdx = Math.floor(Math.random() * clusterCenters.length)
            if (endIdx === startIdx) endIdx = (startIdx + 1) % clusterCenters.length

            const start = clusterCenters[startIdx]
            const end = clusterCenters[endIdx]

            // Interpolate with noise for organic look
            const progress = Math.random()
            const p = new THREE.Vector3().lerpVectors(start, end, progress)

            // Add cosmic noise (scatter)
            p.add(new THREE.Vector3(
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30,
                (Math.random() - 0.5) * 30
            ))

            pos.push(p.x, p.y, p.z)
            // Offset for line segment length
            pos.push(p.x + (Math.random() - 0.5) * 2, p.y + (Math.random() - 0.5) * 2, p.z + (Math.random() - 0.5) * 2)

            // Color based on chaos/energy
            const color = new THREE.Color(0x4488ff).lerp(new THREE.Color(0xff00ff), Math.random())
            col.push(color.r, color.g, color.b)
            col.push(color.r * 0.5, color.g * 0.5, color.b * 0.5)
        }

        return {
            positions: new Float32Array(pos),
            colors: new Float32Array(col)
        }
    }, [])

    useFrame((state) => {
        if (!linesRef.current) return
        // Pulsuation effect
        const mat = linesRef.current.material as THREE.LineBasicMaterial
        mat.opacity = 0.2 + Math.sin(state.clock.elapsedTime) * 0.1
    })

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={colors.length / 3} array={colors} itemSize={3} />
            </bufferGeometry>
            <lineBasicMaterial vertexColors transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
    )
}

function SuperclusterMarker({ name, pos, color, chaos }: { name: string, pos: number[], color: string, chaos: number }) {
    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (ref.current) {
            // Hover animation
            ref.current.position.y = pos[1] + Math.sin(state.clock.elapsedTime * 0.5) * 2
        }
    })

    return (
        <group ref={ref} position={new THREE.Vector3(...pos)}>
            {/* The Core Galaxy */}
            <mesh>
                <sphereGeometry args={[1.5, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.8} />
            </mesh>
            {/* Glow Halo */}
            <mesh scale={[3, 3, 3]}>
                <sphereGeometry args={[1, 16, 16]} />
                <meshBasicMaterial color={color} transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>

            {/* Label */}
            <Billboard position={[0, 4, 0]}>
                <Text
                    fontSize={2}
                    color={color}
                    font="/fonts/static/Roboto-Bold.ttf"
                    anchorY="bottom"
                    outlineWidth={0.05}
                    outlineColor="#000000"
                >
                    {name}
                </Text>
                <Text
                    position={[0, -1.5, 0]}
                    fontSize={0.8}
                    color="#ffffff"
                    font="/fonts/static/Roboto-Regular.ttf"
                    anchorY="top"
                    fillOpacity={0.6}
                >
                    {`z: ${(Math.random() * 0.1).toFixed(3)} // M: 10^15 M☉`}
                </Text>
            </Billboard>
        </group>
    )
}

function DarkMatterHalo({ chaos }: { chaos: number }) {
    // Volumetric cloud representing unseen mass
    const count = 200
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            pos: new THREE.Vector3(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            ),
            scale: 2 + Math.random() * 8
        }))
    }, [])

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime

        particles.forEach((p, i) => {
            dummy.position.copy(p.pos)
            // Subtle shifting
            dummy.position.x += Math.sin(t * 0.1 + i) * 0.2
            dummy.scale.setScalar(p.scale * (1 + Math.sin(t * 0.2 + i) * 0.2))
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshBasicMaterial color="#110022" transparent opacity={0.08} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    )
}

function GreatFilterVoid() {
    const mesh = useRef<THREE.Mesh>(null)
    useFrame((state) => {
        if (mesh.current) {
            mesh.current.rotation.y = state.clock.elapsedTime * 0.1
            // Pulse the size of the "Silence"
            const s = 40 + Math.sin(state.clock.elapsedTime * 0.5) * 10
            mesh.current.scale.setScalar(s)
        }
    })

    return (
        <mesh ref={mesh} position={[0, 0, 0]}>
            <sphereGeometry args={[1, 64, 64]} />
            <meshBasicMaterial color="black" transparent opacity={0.9} side={THREE.DoubleSide} />
            {/* Event Horizon Glow */}
            <mesh scale={[1.05, 1.05, 1.05]}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshBasicMaterial color="#ff0000" transparent opacity={0.1} side={THREE.BackSide} blending={THREE.AdditiveBlending} />
            </mesh>
            <Billboard>
                <Text fontSize={4} color="#330000" font="/fonts/static/Roboto-Bold.ttf">THE GREAT SILENCE</Text>
            </Billboard>
        </mesh>
    )
}

function ZooStealthShips({ chaos }: { chaos: number }) {
    // Hidden ships that only appear when chaos is high (movement) or very low (silence)
    const count = 20
    const mesh = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Distributed in the void
    const ships = useMemo(() => new Array(count).fill(0).map(() => ({
        pos: new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100),
        rot: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    })), [])

    useFrame((state) => {
        if (!mesh.current) return
        // Decloak logic: Visibility oscillates or reacts to chaos
        // If Chaos is high (mouse moving), they cloak (hide). If low (stillness), they observe (visible).
        // Let's invert it: They are curious about entropy.

        // ships.forEach... logic moved to avoid loop overhead if not needed, but we need individual updates

        ships.forEach((ship, i) => {
            dummy.position.copy(ship.pos)
            dummy.rotation.copy(ship.rot)
            // Hover
            dummy.position.y += Math.sin(state.clock.elapsedTime + i) * 0.05
            dummy.updateMatrix()
            mesh.current!.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true

        // Stealth Material Update
        const mat = mesh.current.material as THREE.MeshBasicMaterial
        // They flash green when observing
        mat.opacity = THREE.MathUtils.lerp(0, 0.8, chaos)
        mat.color.setHSL(0.3, 1, 0.5) // Alien Green
    })

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <tetrahedronGeometry args={[2, 0]} />
            <meshBasicMaterial color="#00ff00" wireframe transparent opacity={0} />
        </instancedMesh>
    )
}
