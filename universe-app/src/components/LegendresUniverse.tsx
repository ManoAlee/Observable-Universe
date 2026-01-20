import React, { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, GradientTexture, Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { useControls, button } from 'leva'

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
    const [isPlaying, setIsPlaying] = useState(true)
    const speedRef = useRef(1)

    // Leva Controls for interactivity
    useControls('Legendre Proof', {
        Speed: { value: 1, min: 0.1, max: 10, onChange: (v) => speedRef.current = v },
        'Jump to N': { value: 1, min: 1, max: 100, step: 1, onChange: (v) => setCurrentN(v) },
        'Pause/Play': button(() => setIsPlaying(p => !p))
    })

    // Auto-increment logic
    useEffect(() => {
        if (!isPlaying) return
        const interval = setInterval(() => {
            // Speed determines how fast we increment. 
            // Simple implementation: Just tick every X ms based on speed? 
            // Better: Tick faster.
        }, 1000) // Base tick

        // Using requestAnimationFrame approach for variable speed
        let lastTime = performance.now()
        const loop = (time: number) => {
            if (!isPlaying) return
            const delta = time - lastTime
            if (delta > (3000 / speedRef.current)) {
                setCurrentN(prev => {
                    const next = prev + 1
                    return next > 200 ? 1 : next
                })
                lastTime = time
            }
            requestAnimationFrame(loop)
        }
        const handle = requestAnimationFrame(loop)
        return () => cancelAnimationFrame(handle)
    }, [isPlaying])

    const { start, end, numbers, primeCount } = useMemo(() => {
        const s = currentN * currentN
        const e = (currentN + 1) * (currentN + 1)
        const nums = []
        let pCount = 0
        for (let i = s; i <= e; i++) {
            const prime = isPrime(i)
            if (prime) pCount++
            nums.push({ value: i, isPrime: prime, isSquare: i === s || i === e })
        }
        return { start: s, end: e, numbers: nums, primeCount: pCount }
    }, [currentN])

    return (
        <group>
            <Stars />

            {/* The Prime Helix */}
            <group position={[0, -10, 0]}>
                {numbers.map((n, index) => {
                    // Helix Math
                    const angle = (index * 0.5)      // Tighter spiral
                    const radius = 15 + Math.sin(index * 0.1) * 2
                    const y = index * 1.2
                    const x = Math.cos(angle) * radius
                    const z = Math.sin(angle) * radius

                    return (
                        <group key={n.value} position={[x, y, z]}>
                            <NumberNode n={n} />
                            {/* Connection to next node */}
                            {index > 0 && (
                                <ConnectionLine
                                    start={[0, 0, 0]}
                                    end={[
                                        -x + (Math.cos((index - 1) * 0.5) * (15 + Math.sin((index - 1) * 0.1) * 2)),
                                        -1.2,
                                        -z + (Math.sin((index - 1) * 0.5) * (15 + Math.sin((index - 1) * 0.1) * 2))
                                    ]}
                                />
                            )}
                        </group>
                    )
                })}
            </group>

            {/* Proof HUD */}
            <Billboard position={[0, 5, -25]}>
                <Text fontSize={3} color={primeCount > 0 ? "#00ff00" : "#ff0000"} font="/fonts/Roboto-VariableFont_wdth,wght.ttf" outlineWidth={0.1} outlineColor="#000000">
                    {primeCount > 0 ? "CONJECTURE VERIFIED" : "SEARCHING..."}
                </Text>
                <Text position={[0, -3, 0]} fontSize={1.2} color="#ffffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {`Interval: [${start}, ${end}]`}
                </Text>
                <Text position={[0, -5, 0]} fontSize={1} color="#ffd700" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {`Primes Found: ${primeCount}`}
                </Text>
                <Text position={[0, -7, 0]} fontSize={0.8} color="#aaaaaa" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {`n = ${currentN}`}
                </Text>
            </Billboard>
        </group>
    )
}

function NumberNode({ n }: { n: { value: number, isPrime: boolean, isSquare: boolean } }) {
    const mesh = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (mesh.current && n.isPrime) {
            mesh.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.2)
        }
    })

    return (
        <group>
            <mesh ref={mesh}>
                <boxGeometry args={[n.isSquare ? 4 : 1.5, n.isSquare ? 1 : 1.5, n.isSquare ? 4 : 1.5]} />
                <meshStandardMaterial
                    color={n.isSquare ? "#00ffff" : (n.isPrime ? "#ffd700" : "#222222")}
                    emissive={n.isPrime ? "#ffaa00" : (n.isSquare ? "#00aaaa" : "#000000")}
                    emissiveIntensity={n.isPrime ? 3 : 0.5}
                    roughness={0.2}
                    metalness={0.8}
                />
            </mesh>
            {n.isPrime && (
                <pointLight distance={10} intensity={2} color="#ffd700" />
            )}
            <Billboard position={[0, n.isSquare ? 2.5 : 2, 0]}>
                <Text fontSize={n.isSquare ? 2 : 1} color={n.isPrime ? "#ffd700" : "#ffffff"} font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {n.value}
                </Text>
            </Billboard>
        </group>
    )
}

function ConnectionLine({ start, end }: { start: number[], end: number[] }) {
    const geometry = useMemo(() => {
        const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)]
        return new THREE.BufferGeometry().setFromPoints(points)
    }, [start, end])

    return (
        <line geometry={geometry}>
            <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
        </line>
    )
}

function Stars() {
    const count = 2000
    const [positions] = useState(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 300
        return pos
    })
    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.2} color="white" transparent opacity={0.6} />
        </points>
    )
}
