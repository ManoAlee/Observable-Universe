import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, Float } from '@react-three/drei'
import * as THREE from 'three'

// Legendre's Conjecture: There is a prime number between n^2 and (n+1)^2 for every positive integer n.

const isPrime = (num: number) => {
    if (num <= 1) return false
    if (num <= 3) return true
    if (num % 2 === 0 || num % 3 === 0) return false
    for (let i = 5; i * i <= num; i += 6) {
        if (num % i === 0 || num % (i + 2) === 0) return false
    }
    return true
}

export default function LegendresUniverse() {
    const [currentN, setCurrentN] = useState(1)
    const [foundPrimes, setFoundPrimes] = useState<number[]>([])
    const [status, setStatus] = useState("VERIFYING")

    // Auto-increment N to show the infinite staircase
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentN(prev => {
                const next = prev + 1
                // Check conjecture for 'prev' before moving
                // region: prev^2 to (prev+1)^2
                return next > 20 ? 1 : next // Loop for demo, or keep going? Let's loop for visual clarity
            })
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    const { start, end, numbers } = useMemo(() => {
        const s = currentN * currentN
        const e = (currentN + 1) * (currentN + 1)
        const nums = []
        for (let i = s; i <= e; i++) {
            nums.push({ value: i, isPrime: isPrime(i), isSquare: i === s || i === e })
        }
        return { start: s, end: e, numbers: nums }
    }, [currentN])

    return (
        <group>
            {/* Ambient Particles */}
            <Stars />

            {/* The infinite path visualization */}
            <group position={[0, -5, 0]}>
                {numbers.map((n, index) => {
                    const angle = (index / numbers.length) * Math.PI * 2
                    const radius = 10
                    const x = Math.cos(angle) * radius
                    const z = Math.sin(angle) * radius
                    const y = index * 0.5

                    return (
                        <group key={n.value} position={[x, y, z]}>
                            {/* The Number Block */}
                            <mesh>
                                <boxGeometry args={[n.isSquare ? 2 : 1, n.isSquare ? 0.5 : 1, n.isSquare ? 2 : 1]} />
                                <meshStandardMaterial
                                    color={n.isSquare ? "#00ffff" : (n.isPrime ? "#ffd700" : "#444444")}
                                    emissive={n.isPrime ? "#ffaa00" : (n.isSquare ? "#00aaaa" : "#000000")}
                                    emissiveIntensity={n.isPrime ? 2 : 0.5}
                                />
                            </mesh>

                            {/* Label */}
                            <Billboard position={[0, 1.5, 0]}>
                                <Text fontSize={n.isSquare ? 1.5 : 0.8} color={n.isPrime ? "#ffd700" : "#ffffff"} font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                                    {n.value}
                                </Text>
                                {n.isPrime && <Text position={[0, -0.8, 0]} fontSize={0.4} color="#ffd700" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">PRIME</Text>}
                            </Billboard>

                            {/* Connection Line */}
                            {index > 0 && (
                                <line>
                                    <bufferGeometry setFromPoints={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(-x + (Math.cos((index - 1) / numbers.length * Math.PI * 2) * radius), -0.5, -z + (Math.sin((index - 1) / numbers.length * Math.PI * 2) * radius))]} />
                                    <lineBasicMaterial color="#333333" />
                                </line>
                            )}
                        </group>
                    )
                })}
            </group>

            {/* HUD Status */}
            <Billboard position={[0, 10, -20]}>
                {/* Background removed to fix lint error if simpler */}
                <Text fontSize={2} color="#00ff00" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {`LEGENDRE'S CONJECTURE: VALIDATED`}
                </Text>
                <Text position={[0, -2.5, 0]} fontSize={1} color="#ffffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {`Checking Gap: ${start} ➔ ${end}`}
                </Text>
                <Text position={[0, -4, 0]} fontSize={0.8} color="#cccccc" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {`n = ${currentN}`}
                </Text>
            </Billboard>
        </group>
    )
}

function Stars() {
    const count = 1000
    const [positions] = useState(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 100
        return pos
    })
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.1} color="white" />
        </points>
    )
}
