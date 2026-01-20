import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SolarActivityGlobe({ kp }: { kp: number }) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Color interpolator: Yellow (0) -> Orange (4) -> Red (9)
    const color = useMemo(() => {
        const c = new THREE.Color()
        if (kp < 4) c.setHSL(0.15, 1.0, 0.5) // Yellow
        else if (kp < 7) c.setHSL(0.08, 1.0, 0.5) // Orange
        else c.setHSL(0.0, 1.0, 0.5) // Red
        return c
    }, [kp])

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005 + (kp * 0.002)
            // Pulse size based on Kp
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * (0.01 * kp)
            meshRef.current.scale.set(scale, scale, scale)
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[4, 64, 64]} />
            <meshStandardMaterial
                color={color}
                emissive={color}
                emissiveIntensity={0.5 + kp * 0.1}
                wireframe={false}
            />
            {/* Corona / Glow */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[4, 32, 32]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} wireframe />
            </mesh>
        </mesh>
    )
}
