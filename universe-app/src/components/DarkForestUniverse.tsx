import { useRef, useState, useMemo, useCallback } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Billboard, Sparkles, Stars, Float, Environment, Ring, Line } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'

// Types for our Dark Forest residents
type HunterState = 'HIDDEN' | 'SUSPICIOUS' | 'BROADCASTING' | 'DESTROYED'

interface HunterAgent {
    id: string
    position: THREE.Vector3
    state: HunterState
    fear: number // 0-1, affects flickering/movement
    stealth: number // 0-1, how hard to see
    civilizationName: string
    lastBroadcastTime: number
}

const FOREST_DENSITY = 40
const FIELD_SIZE = 80

export default function DarkForestUniverse() {
    const { camera } = useThree()

    // -- STATE --
    const [hunters, setHunters] = useState<HunterAgent[]>(() => {
        return new Array(FOREST_DENSITY).fill(0).map((_, i) => ({
            id: `CIV-${i}`,
            position: new THREE.Vector3(
                (Math.random() - 0.5) * FIELD_SIZE,
                (Math.random() - 0.5) * FIELD_SIZE,
                (Math.random() - 0.5) * FIELD_SIZE
            ),
            state: 'HIDDEN',
            fear: Math.random(),
            stealth: 0.8 + Math.random() * 0.2,
            civilizationName: `Civilization ${i}`,
            lastBroadcastTime: 0
        }))
    })

    // Photoid Projectiles (The Strike)
    const [photoids, setPhotoids] = useState<{ targetId: string, start: THREE.Vector3, current: THREE.Vector3, active: boolean }[]>([])

    // -- LOGIC --

    const broadcastCoordinates = useCallback((id: string) => {
        setHunters(prev => prev.map(h => {
            if (h.id === id && h.state !== 'DESTROYED') {
                launchPhotoid(h)
                return { ...h, state: 'BROADCASTING', lastBroadcastTime: Date.now() }
            }
            return h
        }))
    }, [])

    const launchPhotoid = (target: HunterAgent) => {
        const origin = target.position.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 100
        ).normalize().multiplyScalar(100)) // Start far out

        setPhotoids(prev => [...prev, {
            targetId: target.id,
            start: origin,
            current: origin,
            active: true
        }])
    }

    // Update loop for logic and animations
    useFrame((state, delta) => {
        // Animate Photoids
        if (photoids.length > 0) {
            setPhotoids(prev => prev.map(p => {
                if (!p.active) return p

                const targetHunter = hunters.find(h => h.id === p.targetId)
                if (!targetHunter) return { ...p, active: false }

                const dir = targetHunter.position.clone().sub(p.current).normalize()
                const speed = 200 * delta // Faster strike
                const nextPos = p.current.clone().add(dir.multiplyScalar(speed))

                // Check impact
                if (p.current.distanceTo(targetHunter.position) < 3) {
                    // DESTROY TARGET
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
            {/* ATMOSPHERE: The Dark Forest is DARK but REFLECTIVE */}
            <color attach="background" args={['#000000']} />
            <fogExp2 attach="fog" args={['#000000', 0.03]} />

            {/* CRITICAL FOR REFLECTIONS: Invisible environment map */}
            <Environment preset="city" />

            {/* Suspenseful Environment */}
            <Stars radius={150} depth={50} count={2000} factor={4} saturation={0} fade speed={0.1} />

            {/* "Cosmic Dust" */}
            <Sparkles
                count={300}
                scale={100}
                size={4}
                speed={0.2}
                opacity={0.1}
                color="#ffffff"
            />

            {/* HUNTERS (Civilizations) */}
            {hunters.map((hunter) => (
                <HunterNode
                    key={hunter.id}
                    data={hunter}
                    onBroadcast={() => broadcastCoordinates(hunter.id)}
                />
            ))}

            {/* PHOTOIDS (The Droplet/Arrow) */}
            {photoids.map((p, i) => (
                <group key={`photoid-${i}`} position={p.current}>
                    {/* The Projectile Core */}
                    <mesh>
                        <sphereGeometry args={[0.5, 16, 16]} />
                        <meshBasicMaterial color="#ffffff" toneMapped={false} />
                    </mesh>
                    {/* Massive Light Trail */}
                    <pointLight intensity={10} distance={50} color="#00ffff" />
                    <Line
                        points={[new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, 20)]}
                        color="#00ffff"
                        lineWidth={5}
                        transparent
                        opacity={0.5}
                    />
                </group>
            ))}

            {/* POST PROCESSING */}
            {/* Local PostProcessing removed for performance - handled by App.tsx */}
        </group>
    )
}

// --- SUB-COMPONENT: HUNTER NODE ---
function HunterNode({ data, onBroadcast }: { data: HunterAgent, onBroadcast: () => void }) {
    const mesh = useRef<THREE.Group>(null)
    const sonarRef = useRef<THREE.Group>(null)
    const [hovered, setHover] = useState(false)
    const { camera } = useThree()

    useFrame((state, delta) => {
        if (!mesh.current || data.state === 'DESTROYED') return

        const t = state.clock.elapsedTime

        // Fluid idle breathing - Damped for smoothness
        const yTarget = Math.sin(t + data.position.x) * 0.5
        mesh.current.position.y = THREE.MathUtils.damp(mesh.current.position.y, data.position.y + yTarget, 2, delta)

        mesh.current.lookAt(camera.position)

        // Sonar rotation
        if (sonarRef.current && (hovered || data.state === 'BROADCASTING')) {
            sonarRef.current.rotation.z -= delta * 2
        }
    })

    if (data.state === 'DESTROYED') {
        return (
            <group position={data.position}>
                <Sparkles count={50} scale={5} color="orange" speed={5} size={6} />
                <pointLight color="orange" intensity={2} distance={10} />
                <mesh>
                    <sphereGeometry args={[0.1, 8, 8]} />
                    <meshBasicMaterial color="gray" wireframe />
                </mesh>
            </group>
        )
    }

    // Material props - High Performance Liquid Metal
    const isExposed = data.state === 'BROADCASTING'
    const color = isExposed ? '#ff0000' : (hovered ? '#00ffff' : '#222')

    // Scale animation
    const pulseScale = isExposed ? 1.5 : 1

    return (
        <group
            ref={mesh}
            position={data.position}
            onPointerOver={(e) => { e.stopPropagation(); setHover(true) }}
            onPointerOut={() => setHover(false)}
            onDoubleClick={(e) => { e.stopPropagation(); onBroadcast() }}
        >
            <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
                {/* The "Civilization" Bubble */}
                <mesh scale={[pulseScale, pulseScale, pulseScale]}>
                    <sphereGeometry args={[0.7, 32, 32]} />
                    {/* OPTIMIZATION: MeshPhysicalMaterial is much faster than MeshTransmissionMaterial */}
                    <meshPhysicalMaterial
                        color={color}
                        emissive={color}
                        emissiveIntensity={isExposed ? 2 : (hovered ? 0.5 : 0)}
                        metalness={0.9}
                        roughness={0.1}
                        clearcoat={1}
                        clearcoatRoughness={0.1}
                        reflectivity={1}
                    />
                </mesh>

                {/* CREATIVE FRONT: Sonar System */}
                {(hovered || isExposed) && (
                    <group ref={sonarRef}>
                        {/* Radar Sweep Line */}
                        <mesh rotation={[0, 0, 0]}>
                            <circleGeometry args={[2, 32, 0, 0.5]} />
                            <meshBasicMaterial color={color} transparent opacity={0.2} side={THREE.DoubleSide} />
                        </mesh>
                        {/* Static Rings */}
                        <Ring args={[1.9, 1.95, 32]} >
                            <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
                        </Ring>
                        <Ring args={[1.0, 1.02, 32]} >
                            <meshBasicMaterial color={color} transparent opacity={0.3} side={THREE.DoubleSide} />
                        </Ring>
                    </group>
                )}

                {/* AR HUD Overlay */}
                {(hovered || isExposed) && (
                    <Billboard position={[0, 2.5, 0]}>
                        <group scale={0.5}>
                            <Text fontSize={0.5} color={color} anchorY="bottom" font="/fonts/Roboto-VariableFont_wdth,wght.ttf" letterSpacing={0.1}>
                                {isExposed ? '!!! BROADCAST DETECTED !!!' : `// ${data.civilizationName} //`}
                            </Text>
                            <Text position={[0, -0.3, 0]} fontSize={0.25} color="#aaaaaa" anchorY="top" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                                {isExposed ? `IMPACT: ${((Date.now() - data.lastBroadcastTime) / 1000).toFixed(1)}s` : `STEALTH: ${(data.stealth * 100).toFixed(0)}% | FEAR: ${(data.fear * 100).toFixed(0)}%`}
                            </Text>
                            <Text position={[0, -0.6, 0]} fontSize={0.2} color="#ffaa00" anchorY="top" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                                {isExposed ? '' : 'DOUBLE CLICK TO BROADCAST'}
                            </Text>
                        </group>
                    </Billboard>
                )}
            </Float>
        </group>
    )
}
