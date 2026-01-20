import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CosmicWebProps {
    clusters?: any
    isDecoding?: boolean
    chaos?: number
}

export default function CosmicWeb({ isDecoding = false, chaos = 0 }: CosmicWebProps) {
    const linesRef = useRef<THREE.LineSegments>(null)
    const pointsRef = useRef<THREE.Points>(null)
    const count = 1000 // Optimized count for performance

    // Generate stable topology once
    const { positions, indices, colors } = useMemo(() => {
        const nodes = []
        const posArray = []
        const colArray = []

        // Generate Galaxy Nodes
        for (let i = 0; i < count; i++) {
            const r = Math.pow(Math.random(), 0.5) * 150
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            const x = r * Math.sin(phi) * Math.cos(theta)
            const y = r * Math.sin(phi) * Math.sin(theta)
            const z = r * Math.cos(phi)

            nodes.push(new THREE.Vector3(x, y, z))
            posArray.push(x, y, z)

            // Color gradient based on depth
            const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.8, 0.5)
            colArray.push(color.r, color.g, color.b)
        }

        // Generate Fixed Connections (The "Web")
        const idx = []
        for (let i = 0; i < count; i++) {
            // Connect to 3 nearest neighbors
            let distinctDistances: { id: number, dist: number }[] = []
            for (let j = 0; j < count; j++) {
                if (i === j) continue
                const d = nodes[i].distanceTo(nodes[j])
                if (d < 30) {
                    distinctDistances.push({ id: j, dist: d })
                }
            }
            // Sort by distance and take top 3
            distinctDistances.sort((a, b) => a.dist - b.dist)
            distinctDistances.slice(0, 3).forEach(n => {
                idx.push(i, n.id)
            })
        }

        return {
            positions: new Float32Array(posArray),
            indices: idx,
            colors: new Float32Array(colArray)
        }

    }, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (pointsRef.current) {
            pointsRef.current.rotation.y = t * 0.02 * (1 + chaos)
            // Jitter shake on high entropy
            if (chaos > 0.5) {
                pointsRef.current.position.x = (Math.random() - 0.5) * chaos
                pointsRef.current.position.y = (Math.random() - 0.5) * chaos
            } else {
                pointsRef.current.position.set(0, 0, 0)
            }
        }
        if (linesRef.current) {
            linesRef.current.rotation.y = t * 0.02 * (1 + chaos)
            if (chaos > 0.5) {
                linesRef.current.position.x = pointsRef.current?.position.x || 0
                linesRef.current.position.y = pointsRef.current?.position.y || 0
            } else {
                linesRef.current.position.set(0, 0, 0)
            }
        }
    })

    return (
        <group>
            {/* The Web Strings */}
            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                    <bufferAttribute attach="index" count={indices.length} array={new Uint16Array(indices)} itemSize={1} />
                </bufferGeometry>
                <lineBasicMaterial color="#4488ff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
            </lineSegments>

            {/* The Galaxy Nodes */}
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
                </bufferGeometry>
                <pointsMaterial size={0.8} vertexColors transparent opacity={0.8} sizeAttenuation blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>

            {/* Expansion Haze */}
            <mesh scale={[200, 200, 200]}>
                <sphereGeometry args={[1, 32, 32]} />
                <meshBasicMaterial color="#020010" side={THREE.BackSide} transparent opacity={0.5} />
            </mesh>
        </group>
    )
}
