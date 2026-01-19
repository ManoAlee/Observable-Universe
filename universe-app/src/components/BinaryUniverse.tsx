import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface BinaryUniverseProps {
    depth: number
    observer: THREE.Vector2
    isDecoding?: boolean
}

export default function BinaryUniverse({ depth, observer, isDecoding = false }: BinaryUniverseProps) {
    return (
        <group>
            {/* Central Processing Core */}
            <CPUCore depth={depth} isDecoding={isDecoding} />

            {/* Vertical Data Streams */}
            <DataStreams count={50} depth={depth} observer={observer} />

            {/* Ambient Hex Noise */}
            <BinaryBackground count={2000} />

            {/* Holographic Scanning Plane */}
            <ScanningPlane depth={depth} />
        </group>
    )
}

function CPUCore({ depth, isDecoding }: { depth: number, isDecoding: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const pointsRef = useRef<THREE.Points>(null)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.2
            meshRef.current.scale.setScalar(2 + Math.sin(t * 2.0) * 0.1)
        }
        if (pointsRef.current) {
            pointsRef.current.rotation.y = -t * 0.4
        }
    })

    return (
        <group>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[2, 0]} />
                <meshPhongMaterial
                    color={isDecoding ? "#00ffcc" : "#00ff44"}
                    emissive={isDecoding ? "#00ffcc" : "#004411"}
                    emissiveIntensity={2}
                    wireframe
                />
            </mesh>
            <points ref={pointsRef}>
                <sphereGeometry args={[4, 32, 32]} />
                <pointsMaterial size={0.05} color="#00ff44" transparent opacity={0.3} />
            </points>
        </group>
    )
}

function DataStreams({ count, depth, observer }: { count: number, depth: number, observer: THREE.Vector2 }) {
    return (
        <group>
            {[...Array(count)].map((_, i) => (
                <Stream key={i} index={i} observer={observer} />
            ))}
        </group>
    )
}

function Stream({ index, observer }: { index: number, observer: THREE.Vector2 }) {
    const pointsRef = useRef<THREE.Points>(null)
    const count = 20
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        const x = (Math.random() - 0.5) * 60
        const z = (Math.random() - 0.5) * 60
        for (let i = 0; i < count; i++) {
            p[i * 3] = x
            p[i * 3 + 1] = i * 2 - 20
            p[i * 3 + 2] = z
        }
        return p
    }, [])

    useFrame((state) => {
        if (pointsRef.current) {
            const t = state.clock.getElapsedTime()
            const yOffset = (t * 5.0 + index) % 40
            pointsRef.current.position.y = -yOffset + 20

            // Interaction with observer
            const dummyPos = new THREE.Vector3(positions[0], pointsRef.current.position.y, positions[2])
            const obsPos = new THREE.Vector3(observer.x * 20, 0, observer.y * 20)
            const d = dummyPos.distanceTo(obsPos)
            if (d < 10) {
                pointsRef.current.scale.setScalar(1 + (10 - d) * 0.2)
            } else {
                pointsRef.current.scale.setScalar(1.0)
            }
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.4}
                color="#00ff44"
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

function BinaryBackground({ count }: { count: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 150
            p[i * 3 + 1] = (Math.random() - 0.5) * 150
            p[i * 3 + 2] = (Math.random() - 0.5) * 150
        }
        return p
    }, [])

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#00ff44" transparent opacity={0.1} />
        </points>
    )
}

function ScanningPlane({ depth }: { depth: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 30
        }
    })

    return (
        <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[100, 100]} />
            <meshBasicMaterial color="#00ff44" transparent opacity={0.05} side={THREE.DoubleSide} />
        </mesh>
    )
}

