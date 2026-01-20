import React from 'react'
import { Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'

interface DetailPanelProps {
    position: number[]
    text: string
    color: string
}

export default function DetailPanel({ position, text, color }: DetailPanelProps) {
    return (
        <Billboard position={new THREE.Vector3(...position)}>
            <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[15, 6]} />
                <meshBasicMaterial color="#000000" transparent opacity={0.9} />
                <lineSegments>
                    <edgesGeometry args={[new THREE.PlaneGeometry(15, 6)]} />
                    <lineBasicMaterial color={color} />
                </lineSegments>
            </mesh>
            <Text position={[0, 0, 0]} fontSize={0.6} color={color} font="/fonts/Roboto-VariableFont_wdth,wght.ttf" textAlign="center">
                {text}
            </Text>
        </Billboard>
    )
}
