import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Billboard, Sparkles, Stars, Float, Environment, Ring, Line } from '@react-three/drei'
import * as THREE from 'three'

// Types for our Universal Forest residents
type HunterState = 'HIDDEN' | 'SUSPICIOUS' | 'BROADCASTING' | 'DESTROYED'
type CivType = 'SPHERE' | 'TORUS' | 'OCTAHEDRON' | 'ICOSAHEDRON'

interface HunterAgent {
    id: string
    position: THREE.Vector3
    state: HunterState
    fear: number
    stealth: number
    civilizationName: string
    type: CivType
    lastBroadcastTime: number
}

const FOREST_DENSITY = 100
const GALACTIC_RADIUS = 120

export default function DarkForestUniverse() {
    // -- STATE --
    const [hunters, setHunters] = useState<HunterAgent[]>(() => {
        return new Array(FOREST_DENSITY).fill(0).map((_, i) => {
            const angle = (i / FOREST_DENSITY) * Math.PI * 15
            const radius = (i / FOREST_DENSITY) * GALACTIC_RADIUS
            const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 20
            const y = (Math.random() - 0.5) * 15
            const z = Math.sin(angle) * radius + (Math.random() - 0.5) * 20

            const types: CivType[] = ['SPHERE', 'TORUS', 'OCTAHEDRON', 'ICOSAHEDRON']
            return {
                id: `CIV-${i}`,
                position: new THREE.Vector3(x, y, z),
                state: 'HIDDEN',
                fear: Math.random(),
                stealth: 0.8 + Math.random() * 0.2,
                civilizationName: `Civilization ${i}`,
                type: types[Math.floor(Math.random() * types.length)],
                lastBroadcastTime: 0
            }
        })
    })

    const [photoids, setPhotoids] = useState<{ targetId: string, current: THREE.Vector3, active: boolean }[]>([])

    const launchPhotoid = (target: HunterAgent) => {
        const origin = target.position.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        ).normalize().multiplyScalar(100))

        setPhotoids(prev => [...prev, {
            targetId: target.id,
            current: origin,
            active: true
        }])
    }

    const broadcastCoordinates = useCallback((id: string) => {
        setHunters(prev => prev.map(h => {
            if (h.id === id && h.state !== 'DESTROYED') {
                launchPhotoid(h)
                return { ...h, state: 'BROADCASTING', lastBroadcastTime: Date.now() }
            }
            return h
        }))
    }, [])

    useFrame((state, delta) => {
        if (photoids.length > 0) {
            setPhotoids(prev => prev.map(p => {
                if (!p.active) return p
                const targetHunter = hunters.find(h => h.id === p.targetId)
                if (!targetHunter) return { ...p, active: false }
                const dir = targetHunter.position.clone().sub(p.current).normalize()
                const speed = 200 * delta
                const nextPos = p.current.clone().add(dir.multiplyScalar(speed))
                if (p.current.distanceTo(targetHunter.position) < 3) {
                    setHunters(currHunters => currHunters.map(h =>
                        h.id === p.targetId ? { ...h, state: 'DESTROYED' } : h
                    ))
                    return { ...p, active: false }
                }
                return { ...p, current: nextPos }
            }).filter(p => p.active))
        }
    })

    return (
        <group>
            <color attach="background" args={['#000']} />
            <fogExp2 attach="fog" args={['#000', 0.02]} />
            <Environment preset="city" />
            <Stars radius={150} depth={50} count={2000} factor={4} saturation={0} fade speed={0.1} />
            <Sparkles count={300} scale={100} size={4} speed={0.2} opacity={0.1} color="#ffffff" />

            {hunters.map((hunter) => (
                <HunterNode
                    key={hunter.id}
                    data={hunter}
                    onBroadcast={() => broadcastCoordinates(hunter.id)}
                />
            ))}

            {photoids.map((p, i) => (
                <group key={`photoid-${i}`} position={p.current}>
                    <PhotoidStrike />
                </group>
            ))}

            <Scanner hunters={hunters} setHunters={setHunters} />
        </group>
    )
}

function HunterNode({ data, onBroadcast }: { data: HunterAgent, onBroadcast: () => void }) {
    const mesh = useRef<THREE.Group>(null)
    const sonarRef = useRef<THREE.Group>(null)
    const [hovered, setHover] = useState(false)
    const { camera } = useThree()

    useFrame((state, delta) => {
        if (!mesh.current || data.state === 'DESTROYED') return
        const t = state.clock.elapsedTime
        const isScanned = data.state === 'SUSPICIOUS' || data.state === 'BROADCASTING'
        const speed = 1 + data.fear * 3 + (isScanned ? 5 : 0)
        const throb = (1 + Math.sin(t * speed + data.position.x) * 0.1) * (isScanned ? 1.2 : 1)
        mesh.current.scale.lerp(new THREE.Vector3(throb, throb, throb), 0.1)
        mesh.current.lookAt(camera.position)
        if (sonarRef.current && (hovered || isScanned)) {
            sonarRef.current.rotation.z -= delta * (isScanned ? 5 : 2)
        }
    })

    if (data.state === 'DESTROYED') {
        return (
            <group position={data.position}>
                <Sparkles count={50} scale={5} color="#ffaa00" speed={5} size={6} />
                <mesh><sphereGeometry args={[0.2, 8, 8]} /><meshBasicMaterial color="#333" wireframe /></mesh>
            </group>
        )
    }

    const isExposed = data.state === 'BROADCASTING'
    const color = isExposed ? '#ff0044' : (hovered ? '#00ffff' : '#111')

    return (
        <group
            ref={mesh}
            position={data.position}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
            onPointerOut={() => setHover(false)}
            onDoubleClick={(e) => { e.stopPropagation(); onBroadcast() }}
        >
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh>
                    {data.type === 'SPHERE' && <sphereGeometry args={[1, 32, 32]} />}
                    {data.type === 'TORUS' && <torusGeometry args={[0.8, 0.2, 16, 32]} />}
                    {data.type === 'OCTAHEDRON' && <octahedronGeometry args={[1]} />}
                    {data.type === 'ICOSAHEDRON' && <icosahedronGeometry args={[1]} />}
                    <meshPhysicalMaterial color={color} emissive={color} emissiveIntensity={isExposed ? 5 : 0.1} metalness={1} roughness={0.05} clearcoat={1} transmission={0.5} thickness={1} />
                </mesh>
                {(hovered || isExposed) && (
                    <group>
                        <group ref={sonarRef}>
                            <Ring args={[2, 2.05, 64]}><meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} /></Ring>
                        </group>
                        <Billboard position={[0, 3, 0]}>
                            <group scale={0.5}>
                                <Text fontSize={0.6} color={color} font="/fonts/static/Roboto-Bold.ttf" anchorY="bottom">{isExposed ? 'FORCE_TERMINATION' : data.civilizationName}</Text>
                                <Text position={[0, -0.5, 0]} fontSize={0.3} color="#ffffff" font="/fonts/static/Roboto-Regular.ttf" anchorY="top">{`THREAT_LEVEL: ${(data.fear * 100).toFixed(0)}%`}</Text>
                            </group>
                        </Billboard>
                    </group>
                )}
            </Float>
        </group>
    )
}

function PhotoidStrike() {
    return (
        <group>
            <mesh><sphereGeometry args={[0.5, 16, 16]} /><meshBasicMaterial color="#fff" /></mesh>
            <pointLight intensity={20} distance={60} color="#00ffff" />
            <Line points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 40)]} color="#00ffff" lineWidth={3} transparent opacity={0.6} />
        </group>
    )
}

function Scanner({ hunters, setHunters }: { hunters: HunterAgent[], setHunters: React.Dispatch<React.SetStateAction<HunterAgent[]>> }) {
    const scannerRef = useRef<THREE.Mesh>(null)
    useFrame((state) => {
        const t = state.clock.elapsedTime
        const radius = (t * 20) % 150
        if (scannerRef.current) scannerRef.current.scale.setScalar(radius)

        const revealThreshold = 5
        const toReveal = hunters.filter(h => h.state === 'HIDDEN' && Math.abs(h.position.length() - radius) < revealThreshold).map(h => h.id)
        if (toReveal.length > 0) {
            setHunters(prev => prev.map(h => toReveal.includes(h.id) ? { ...h, state: 'SUSPICIOUS' } : h))
        }
    })
    return (
        <mesh ref={scannerRef} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
            <ringGeometry args={[0.99, 1, 64]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.2} side={THREE.DoubleSide} />
        </mesh>
    )
}
