import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Billboard, Text } from '@react-three/drei'

export default function NeoTracker({ distance }: { distance: number }) {
    const blipRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (blipRef.current) {
            const t = state.clock.elapsedTime
            // Orbit
            blipRef.current.position.x = Math.cos(t) * 3
            blipRef.current.position.z = Math.sin(t) * 3
            // Blink
            blipRef.current.visible = Math.sin(t * 10) > 0
        }
    })

    // Distance mapping: closer = redder, further = greener
    const color = distance < 10 ? "#ff0000" : (distance < 20 ? "#ffff00" : "#00ff00")

    return (
        <group>
            {/* Radar Rings */}
            {[1, 2, 3, 4].map(r => (
                <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[r, r + 0.05, 32]} />
                    <meshBasicMaterial color="#333333" side={THREE.DoubleSide} />
                </mesh>
            ))}

            {/* The Asteroid Blip */}
            <mesh ref={blipRef} position={[3, 0, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshBasicMaterial color={color} />
            </mesh>

            {/* Reality Lock Visualization */}
            <RealityLock distance={distance} />
        </group>
    )
}

function RealityLock({ distance }: { distance: number }) {
    // A green "Laser" that locks onto the target when data is stable
    const lockRef = useRef<THREE.Group>(null);
    const locked = distance > 0; // If we have data, we are locked

    useFrame((state) => {
        if (lockRef.current && locked) {
            lockRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 10) * 0.1; // Micro-adjustments
        }
    });

    if (!locked) return null;

    return (
        <group ref={lockRef} rotation={[0, 0, Math.PI / 4]}>
            {/* Crosshair */}
            <group position={[0, 0, 0]}>
                {[0, 90, 180, 270].map(rot => (
                    <mesh key={rot} rotation={[0, 0, THREE.MathUtils.degToRad(rot)]} position={[0, 5, 0]}>
                        <planeGeometry args={[0.2, 2]} />
                        <meshBasicMaterial color="#00ff00" transparent opacity={0.8} />
                    </mesh>
                ))}
            </group>

            {/* "LOCKED" Text */}
            <Billboard position={[0, -6, 0]}>
                {/* Removed backgroundColor to fix Type Error */}
                <Text fontSize={0.5} color="#00ff00" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    TARGET_LOCKED // DATA_VERIFIED
                </Text>
            </Billboard>
        </group>
    );
}
