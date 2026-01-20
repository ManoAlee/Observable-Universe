import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

interface BiologicUniverseProps {
    observer: THREE.Vector2
    entropy: number
}

export default function BiologicUniverse({ observer, entropy }: BiologicUniverseProps) {
    return (
        <group>
            {/* Cellular Atmosphere (Nucleus Interior) */}
            <fog attach="fog" args={['#000010', 10, 60]} />
            <ambientLight intensity={0.2} color="#001133" />

            {/* Rim lights for SSS effect */}
            <pointLight position={[20, 10, 10]} intensity={3} color="#aabbff" />
            <pointLight position={[-20, -10, -10]} intensity={2} color="#ff0066" />
            <spotLight position={[0, 50, 0]} angle={0.5} penumbra={1} intensity={2} color="#ffffff" />

            {/* The Code of Life */}
            <DoubleHelix />
            <OrganicParticulates />

            {/* Label */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                <Text position={[0, 35, -40]} fontSize={4} color="#00ff88" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    HELIX_PRIME // ORGANIC_CORE
                </Text>
            </Float>
        </group>
    )
}

function DoubleHelix() {
    const groupRef = useRef<THREE.Group>(null)
    const count = 60
    const radius = 5
    const height = 60

    // Organic Material (Subsurface Scattering / Gelatinous)
    const dnaMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
        color: "#aaccff",
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.6, // Glass-like transparency
        thickness: 2.0,    // Volume simulation
        ior: 1.5,          // Index of refraction
        clearcoat: 1.0,    // Wet surface look
        clearcoatRoughness: 0.1,
        emissive: "#002244",
        emissiveIntensity: 0.2
    }), [])

    const basePairs = useMemo(() => {
        const bps = []
        for (let i = 0; i < count; i++) {
            const y = (i / count) * height - (height / 2)
            const angle = i * 0.5
            const x1 = Math.cos(angle) * radius
            const z1 = Math.sin(angle) * radius
            const type = Math.random() > 0.5 ? 'AT' : 'CG'
            bps.push({ x1, y, z1, angle, type })
        }
        return bps
    }, [])

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.1
        }
    })

    return (
        <group ref={groupRef} rotation={[0, 0, Math.PI / 6]}>
            {/* Base Pairs with "Glow" Shader */}
            {basePairs.map((bp, i) => (
                <group key={i} position={[0, bp.y, 0]} rotation={[0, -bp.angle, 0]}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.15, 0.15, radius * 2, 8]} />
                        <meshStandardMaterial
                            color={bp.type === 'AT' ? "#ff0044" : "#4400ff"}
                            emissive={bp.type === 'AT' ? "#ff0022" : "#2200ff"}
                            emissiveIntensity={2.0}
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Organic Nodes (Nucleotides) */}
                    <mesh position={[radius, 0, 0]} material={dnaMaterial}>
                        <sphereGeometry args={[0.9, 32, 32]} />
                    </mesh>
                    <mesh position={[-radius, 0, 0]} material={dnaMaterial}>
                        <sphereGeometry args={[0.9, 32, 32]} />
                    </mesh>
                </group>
            ))}

            {/* Backbone Splines */}
            <BackboneHelix radius={radius} height={height} count={count} offset={0} material={dnaMaterial} />
            <BackboneHelix radius={radius} height={height} count={count} offset={Math.PI} material={dnaMaterial} />
        </group>
    )
}

function BackboneHelix({ radius, height, count, offset, material }: any) {
    const points = useMemo(() => {
        const pts = []
        for (let i = 0; i <= count; i++) {
            const y = (i / count) * height - (height / 2)
            const angle = i * 0.5 + offset
            pts.push(new THREE.Vector3(Math.cos(angle) * radius, y, Math.sin(angle) * radius))
        }
        return new THREE.CatmullRomCurve3(pts)
    }, [])

    return (
        <mesh material={material}>
            <tubeGeometry args={[points, 128, 0.6, 16, false]} />
        </mesh>
    )
}

function OrganicParticulates() {
    const count = 300
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Particles move like fluid/plankton
    const particles = useMemo(() => {
        const p = []
        for (let i = 0; i < count; i++) {
            p.push({
                x: (Math.random() - 0.5) * 80,
                y: (Math.random() - 0.5) * 80,
                z: (Math.random() - 0.5) * 80,
                speed: 0.2 + Math.random() * 0.5,
                phase: Math.random() * Math.PI * 2
            })
        }
        return p
    }, [])

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime

        particles.forEach((p, i) => {
            dummy.position.set(
                p.x + Math.sin(t * p.speed + p.phase) * 1.5,
                p.y + Math.cos(t * p.speed * 0.8 + p.phase) * 1.5,
                p.z + Math.sin(t * 0.3 + p.phase)
            )
            dummy.rotation.set(t * 0.5, t * 0.3, 0)
            const scale = 0.2 + Math.sin(t + i) * 0.1
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[0.5, 0]} />
            <meshPhysicalMaterial
                color="#88ffaa"
                transmission={0.5}
                roughness={0.2}
                clearcoat={1}
                thickness={1}
            />
        </instancedMesh>
    )
}
