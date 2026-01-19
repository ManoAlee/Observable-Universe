import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface CosmicWebProps {
    clusters: any
    isDecoding?: boolean
}

export default function CosmicWeb({ clusters, isDecoding = false }: CosmicWebProps) {
    const groupRef = useRef<THREE.Group>(null)

    const { lines, points, clusterPositions } = useMemo(() => {
        const nodeCount = 3000
        const nodes = []
        const cPositions: THREE.Vector3[] = []

        // SDSS Style: Large Scale Structure Biasing (Filaments/Voids)
        for (let i = 0; i < nodeCount; i++) {
            const r = Math.pow(Math.random(), 0.5) * 200
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)

            let pos = new THREE.Vector3(
                r * Math.sin(phi) * Math.cos(theta),
                r * Math.sin(phi) * Math.sin(theta),
                r * Math.cos(phi)
            )

            // Bias nodes towards "The Great Wall" (plane-like structure)
            const wallBias = Math.exp(-Math.abs(pos.z) / 20.0)
            if (Math.random() < wallBias) {
                nodes.push(pos)
            } else if (Math.random() > 0.95) {
                // Occasional void nodes
                nodes.push(pos)
            }
        }

        // Map clusters
        for (let i = 0; i < clusters.length; i++) {
            cPositions.push(nodes[Math.floor(Math.random() * nodes.length)].clone())
        }

        const linePositions = []
        const filamentColors = []
        const c1 = new THREE.Color('#220033')
        const c2 = new THREE.Color('#00ffff')

        for (let i = 0; i < nodes.length; i++) {
            let conns = 0
            for (let j = i + 1; j < nodes.length; j++) {
                const dist = nodes[i].distanceTo(nodes[j])
                // Dark Matter Filament connections
                if (dist < 15 && conns < 3) {
                    linePositions.push(nodes[i].x, nodes[i].y, nodes[i].z)
                    linePositions.push(nodes[j].x, nodes[j].y, nodes[j].z)
                    const mix = c1.clone().lerp(c2, Math.random())
                    filamentColors.push(mix.r, mix.g, mix.b, mix.r, mix.g, mix.b)
                    conns++
                }
            }
        }

        const lg = new THREE.BufferGeometry()
        lg.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
        lg.setAttribute('color', new THREE.Float32BufferAttribute(filamentColors, 3))
        const pg = new THREE.BufferGeometry().setFromPoints(nodes)

        return { lines: lg, points: pg, clusterPositions: cPositions }
    }, [clusters.length])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.getElapsedTime() * 0.005
        }
    })

    return (
        <group ref={groupRef}>
            <lineSegments geometry={lines}>
                <lineBasicMaterial vertexColors transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
            </lineSegments>

            <points geometry={points}>
                <pointsMaterial size={0.5} color="#ffffff" transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
            </points>

            {clusterPositions.map((pos, i) => (
                <group key={i} position={pos}>
                    <pointLight distance={10} intensity={5} color="#00ffcc" />
                    {/* Geometric Node Marker instead of Text */}
                    <mesh position={[0, 4, 0]} rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                        <octahedronGeometry args={[1]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} />
                    </mesh>
                </group>
            ))}

            {/* Background Haze (Shader) */}
            <mesh>
                <sphereGeometry args={[250, 32, 32]} />
                <meshBasicMaterial color="#050010" side={THREE.BackSide} transparent opacity={0.8} />
            </mesh>
        </group>
    )
}
