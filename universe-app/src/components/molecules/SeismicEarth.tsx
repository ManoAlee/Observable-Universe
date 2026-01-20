import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SeismicEarth({ mag, place }: { mag: number, place?: string }) {
    const meshRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01

            // Seismic Vibration
            if (mag > 2) {
                const shake = (mag - 2) * 0.02
                meshRef.current.position.x = (Math.random() - 0.5) * shake
                meshRef.current.position.y = -10 + (Math.random() - 0.5) * shake
                meshRef.current.position.z = (Math.random() - 0.5) * shake
            }
        }
    })

    return (
        <group ref={meshRef} position={[0, -10, 0]}>
            <mesh>
                <sphereGeometry args={[5, 16, 16]} />
                <meshBasicMaterial color="#0044ff" wireframe transparent opacity={0.3} />
            </mesh>
            {mag > 0 && (
                <mesh>
                    <sphereGeometry args={[5.1, 32, 32]} />
                    <meshBasicMaterial color={mag > 5 ? "#ff0000" : "#00ff00"} wireframe transparent opacity={0.5} />
                </mesh>
            )}
        </group>
    )
}
