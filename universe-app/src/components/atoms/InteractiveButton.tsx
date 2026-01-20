import React, { useState } from 'react'
import { Text } from '@react-three/drei'

interface InteractiveButtonProps {
    label: string
    active: boolean
    onClick: () => void
}

export default function InteractiveButton({ label, active, onClick }: InteractiveButtonProps) {
    const [hovered, set] = useState(false)
    return (
        <group onClick={onClick} onPointerOver={() => set(true)} onPointerOut={() => set(false)}>
            <mesh position={[-2, 0, 0]}>
                <circleGeometry args={[0.8, 16]} />
                <meshBasicMaterial
                    color={active ? "#00ff00" : (hovered ? "#00ffff" : "#ffffff")}
                    transparent={true}
                    opacity={active || hovered ? 1 : 0.2}
                />
            </mesh>
            <Text position={[8, 0, 0]} fontSize={1.2} color={active ? "#00ff00" : (hovered ? "#00ffff" : "#cccccc")} textAlign="left" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                {label} {active ? '>> ACTIVE' : (hovered ? '>> WARP' : '>> STANDBY')}
            </Text>
        </group>
    )
}
