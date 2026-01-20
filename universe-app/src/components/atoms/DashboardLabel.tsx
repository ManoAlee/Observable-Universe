import React from 'react'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'

interface DashboardLabelProps {
    position: number[]
    label: string
    value: string
    color: string
}

export default function DashboardLabel({ position, label, value, color }: DashboardLabelProps) {
    return (
        <Billboard position={new THREE.Vector3(...position)}>
            <Text position={[0, 0.5, 0]} fontSize={0.8} color={color} font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                {label}
            </Text>
            <Text position={[0, -0.5, 0]} fontSize={1.2} color="#ffffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                {value}
            </Text>
        </Billboard>
    )
}
