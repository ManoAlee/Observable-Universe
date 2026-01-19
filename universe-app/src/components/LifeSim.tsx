import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Trail } from '@react-three/drei'
import * as THREE from 'three'

interface LifeSimProps {
    mode: string
    density: number
}

export default function LifeSim({ mode, density }: LifeSimProps) {
    const count = Math.floor(density * 60)

    switch (mode) {
        case 'BINARY': return <BinaryLife count={count} />
        case 'QUANTUM': return <QuantumLife count={count} />
        case 'COSMIC_WEB': return <CosmicLife count={count} />
        case 'STRING_THEORY': return <StringLife count={count} />
        case 'GRAND_UNIFIED': return <TransDimensionalLife count={count} />
        default: return null
    }
}

function BinaryLife({ count }: { count: number }) {
    const groupRef = useRef<THREE.Group>(null)
    const entities = useMemo(() => {
        return [...Array(count)].map(() => ({
            pos: new THREE.Vector3((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50),
            vel: new THREE.Vector3((Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2, (Math.random() - 0.5) * 0.2),
            acc: new THREE.Vector3()
        }))
    }, [count])

    useFrame((state) => {
        if (!groupRef.current) return
        entities.forEach((e, i) => {
            const child = groupRef.current!.children[i]
            if (!child) return

            // Simple Boid rules (Alignment & Cohesion)
            let center = new THREE.Vector3()
            let countNearby = 0
            entities.forEach((other, j) => {
                if (i !== j) {
                    const dist = e.pos.distanceTo(other.pos)
                    if (dist < 10) {
                        center.add(other.pos)
                        countNearby++
                    }
                }
            })
            if (countNearby > 0) {
                center.divideScalar(countNearby)
                e.acc.add(center.sub(e.pos).multiplyScalar(0.001)) // Cohesion
            }

            e.vel.add(e.acc).clampLength(0, 0.2)
            e.pos.add(e.vel)
            e.acc.set(0, 0, 0)

            // Wrap around
            if (e.pos.length() > 40) e.pos.multiplyScalar(-0.9)
            child.position.copy(e.pos)
        })
    })

    return (
        <group ref={groupRef}>
            {entities.map((_, i) => (
                <group key={i}>
                    <mesh scale={[0.4, 0.4, 0.4]}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshBasicMaterial color="#00ff44" transparent opacity={0.8} />
                    </mesh>
                    <Sphere args={[0.1, 8, 8]}>
                        <meshBasicMaterial color="#00ff44" transparent opacity={0.4} />
                    </Sphere>
                </group>
            ))}
        </group>
    )
}

function QuantumLife({ count }: { count: number }) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.getElapsedTime()
            groupRef.current.children.forEach((child, i) => {
                const flicker = Math.sin(t * 10 + i) * 0.5 + 0.5
                child.position.y += Math.sin(t + i) * 0.05
                if (child instanceof THREE.Mesh) {
                    (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 5 + flicker * 15
                }
            })
        }
    })

    return (
        <group ref={groupRef}>
            {Array.from({ length: count }).map((_, i) => (
                <Sphere key={i} args={[0.3, 32, 32]} position={[(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60]}>
                    <meshStandardMaterial
                        color="#ffffff"
                        emissive="#00ffff"
                        emissiveIntensity={10}
                        transparent
                        opacity={0.8}
                    />
                </Sphere>
            ))}
        </group>
    )
}

function CosmicLife({ count }: { count: number }) {
    return (
        <group>
            {Array.from({ length: count }).map((_, i) => (
                <Technosignature key={i} i={i} />
            ))}
        </group>
    )
}

function Technosignature({ i }: { i: number }) {
    const ref = useRef<THREE.Group>(null)
    const pos = useMemo(() => new THREE.Vector3((Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120, (Math.random() - 0.5) * 120), [])

    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime()
            const pulse = Math.sin(t * 3 + i) * 0.5 + 0.5
            ref.current.scale.setScalar(1 + pulse * 0.5)
            ref.current.rotation.y += 0.02
        }
    })

    return (
        <group position={pos} ref={ref}>
            {/* Dyson Ring Proxy */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[2, 0.1, 16, 64]} />
                <meshBasicMaterial color="#00ffcc" transparent opacity={0.6} />
            </mesh>
            <Sphere args={[0.4, 16, 16]}>
                <meshBasicMaterial color="#00ffcc" />
            </Sphere>
            <pointLight distance={15} intensity={5} color="#00ffcc" />
        </group>
    )
}

function StringLife({ count }: { count: number }) {
    const groupRef = useRef<THREE.Group>(null)
    return (
        <group ref={groupRef}>
            {Array.from({ length: count }).map((_, i) => (
                <Trail key={i} width={1} length={15} color={new THREE.Color('#ff00ff')}>
                    <MeshLife i={i} />
                </Trail>
            ))}
        </group>
    )
}

function MeshLife({ i }: { i: number }) {
    const ref = useRef<THREE.Mesh>(null)
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.getElapsedTime() * 0.4 + i
            ref.current.position.set(Math.sin(t) * 25, Math.cos(t * 1.5) * 25, Math.sin(t * 0.8) * 25)
        }
    })
    return <Sphere ref={ref} args={[0.15, 8, 8]}><meshBasicMaterial color="#ff00ff" /></Sphere>
}

function TransDimensionalLife({ count }: { count: number }) {
    const groupRef = useRef<THREE.Group>(null)
    const entities = useMemo(() => {
        return [...Array(count)].map((_, i) => ({
            phase: Math.random() * Math.PI * 2,
            radius: 5 + Math.random() * 40,
            speed: 0.1 + Math.random() * 0.2,
            axis: new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).normalize()
        }))
    }, [count])

    useFrame((state) => {
        if (groupRef.current) {
            const t = state.clock.getElapsedTime()
            groupRef.current.children.forEach((child, i) => {
                const e = entities[i]
                if (!e) return
                const angle = t * e.speed + e.phase
                const x = Math.cos(angle) * e.radius
                const y = Math.sin(angle) * e.radius
                const z = Math.sin(t * 0.5 + i) * 10

                // Position relative to axis
                const pos = new THREE.Vector3(x, y, z).applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), e.axis))
                child.position.copy(pos)

                if (child instanceof THREE.Mesh) {
                    (child.material as THREE.MeshStandardMaterial).emissiveIntensity = 2 + Math.sin(t * 5 + i) * 5
                }
            })
        }
    })

    return (
        <group ref={groupRef}>
            {entities.map((_, i) => (
                <Trail key={i} width={2} length={20} color={new THREE.Color(i % 2 === 0 ? '#00ffff' : '#ff00ff')} attenuation={(t) => t * t}>
                    <Sphere args={[0.2, 16, 16]}>
                        <meshStandardMaterial color="#fff" emissive="#00ffff" emissiveIntensity={10} transparent opacity={0.6} />
                    </Sphere>
                </Trail>
            ))}
        </group>
    )
}
