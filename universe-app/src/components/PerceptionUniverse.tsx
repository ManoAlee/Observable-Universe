import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

import { LSSIData } from '../services/universeDecoder'

interface PerceptionUniverseProps {
    observer: THREE.Vector2
    entropy: number
    lssiData?: LSSIData | null
}

export default function PerceptionUniverse({ observer, entropy, lssiData }: PerceptionUniverseProps) {
    // Derive parameters from Real Data
    const solarNoise = (lssiData?.solarKp || 0) / 9; // 0 to 1
    const seismicShake = (lssiData?.earthMag || 0) / 10; // 0 to 1
    const neoDanger = 20 / (lssiData?.neoDist || 20); // 0 to 1 (Closer is higher)

    // Total System Stress
    const stress = solarNoise + seismicShake + neoDanger;

    return (
        <group>
            {/* Stage 1: The Raw Data Stream (Cosmic Noise) - Driven by Solar Wind */}
            <RawDataStream speed={1.0 + solarNoise * 5.0} density={1.0 + neoDanger} />

            {/* Stage 2: Dimensional Manifolds (Higher Reason) */}
            <DimensionalManifolds stress={stress} />

            {/* Stage 3: The Filter (Dimensionality Reduction) */}
            <DimensionalityFilter stress={stress} />

            {/* Stage 4: Pattern Recognition (Multi-Scale Construct) */}
            <HolographicObject position={[0, 0, 0]} glitchFactor={seismicShake} stress={stress} />

            {/* Stage 5: Semantic Encoding */}
            <SemanticLabels position={[15, 10, 0]} label={stress > 0.5 ? "DIMENSIONAL_COLLAPSE" : "MULTIVERSE_STABLE"} />

            {/* Stage 6: Dimensional Echoes (Prediction Lag across folds) */}
            <DimensionalEchoes position={[0, 0, 0]} lag={80 + stress * 50} count={3} />

            {/* Stage 7: Panpsychism - The Neural-Cosmic Bridge */}
            <PanpsychismField stress={stress} />

            <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                <Text position={[0, 35, -50]} fontSize={4} color={stress > 0.8 ? "#ff00ff" : "#00ffff"} font="/fonts/static/Roboto-Bold.ttf" anchorX="center" anchorY="bottom">
                    {`HYPER_PERCEPTION // DIMENSIONS: ${Math.floor(4 + stress * 7)}D`}
                </Text>
            </Float>
        </group>
    )
}


function RawDataStream({ speed, density }: { speed: number, density: number }) {
    const count = Math.floor(2000 * density)
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    // High speed data particles
    const particles = useMemo(() => {
        return new Array(4000).fill(0).map(() => ({ // Max buffer
            x: (Math.random() - 0.5) * 100 - 60,
            y: (Math.random() - 0.5) * 80,
            z: (Math.random() - 0.5) * 80,
            speed: 1.0 + Math.random() * 2.0,
        }))
    }, [])

    useFrame((state) => {
        if (!meshRef.current) return
        const t = state.clock.elapsedTime
        particles.slice(0, count).forEach((p, i) => {
            // Move fast towards the filter - Speed driven by Solar KP
            let x = p.x + t * p.speed * speed * 5
            if (x > 0) x = -60 + (x % 60) // Reset loop

            dummy.position.set(x, p.y, p.z)
            // Stretch them to look like light beams
            dummy.scale.set(4.0, 0.05, 0.05)
            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
        })
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color="#ff0044" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    )
}

function DimensionalityFilter({ stress }: { stress: number }) {
    const gridRef = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.rotation.z = state.clock.elapsedTime * (0.05 + stress * 0.2)
            gridRef.current.rotation.y = state.clock.elapsedTime * 0.1
        }
    })

    const color = stress > 0.5 ? "#ff00ff" : "#00ffff"

    return (
        <group position={[0, 0, 0]}>
            <group ref={gridRef}>
                <gridHelper args={[100, 50, color, 0x111111]} rotation={[Math.PI / 2, 0, 0]} />
            </group>
            <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[50, 32, 32]} />
                <meshBasicMaterial color="#000" transparent opacity={0.1} wireframe />
            </mesh>
        </group>
    )
}

function DimensionalManifolds({ stress }: { stress: number }) {
    const ref = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.2
            ref.current.rotation.x = state.clock.elapsedTime * 0.1
        }
    })

    return (
        <group ref={ref}>
            <Float speed={2} rotationIntensity={2} floatIntensity={1}>
                {/* Torus Knot - Representing complex dimensions */}
                <mesh position={[20, 0, -10]}>
                    <torusKnotGeometry args={[5, 1.5, 128, 16]} />
                    <meshPhysicalMaterial
                        color="#ff00ff"
                        emissive="#ff00ff"
                        emissiveIntensity={0.5 + stress}
                        metalness={1}
                        roughness={0}
                        transmission={0.8}
                        thickness={2}
                    />
                </mesh>
                <mesh position={[-20, 10, 5]}>
                    <octahedronGeometry args={[6]} />
                    <meshPhysicalMaterial
                        color="#00ffff"
                        wireframe
                        emissive="#00ffff"
                        emissiveIntensity={1}
                    />
                </mesh>
            </Float>
        </group>
    )
}

function HolographicObject({ position, glitchFactor, stress }: { position: [number, number, number], glitchFactor: number, stress: number }) {

    const pointsRef = useRef<THREE.Points>(null)

    // Shader for the "Construct" effect
    const shader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color('#00ccff') },
            uGlitch: { value: 0 }
        },
        vertexShader: `
            uniform float uTime;
            uniform float uGlitch;
            varying float vAlpha;
            const float PI = 3.141592653589793238;

            void main() {
                vec3 pos = position;
                
                // Scanning effect
                float scan = mod(uTime * 2.0, 10.0) - 5.0;
                float dist = abs(pos.y - scan);
                
                // Wiggle glitch based on Seismic data
                pos.x += sin(pos.y * 10.0 + uTime * 5.0) * (0.05 + uGlitch * 0.5);
                pos.z += cos(pos.y * 8.0 + uTime * 3.0) * (uGlitch * 0.5);

                vAlpha = 1.0 - smoothstep(0.0, 1.5, dist);
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = (4.0 / -mvPosition.z) * 100.0; // Size attenuation
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            varying float vAlpha;

            void main() {
                if (vAlpha < 0.1) discard;
                vec2 coord = gl_PointCoord - vec2(0.5);
                if(length(coord) > 0.5) discard;
                
                gl_FragColor = vec4(uColor, vAlpha);
            }
        `
    }), [])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.2
            const mat = pointsRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = state.clock.elapsedTime
            mat.uniforms.uGlitch.value = glitchFactor
        }
    })

    return (
        <group position={position}>
            <points ref={pointsRef}>
                {/* High density sphere for better point cloud look */}
                <sphereGeometry args={[6, 64, 64]} />
                <shaderMaterial args={[shader]} transparent blending={THREE.AdditiveBlending} depthWrite={false} />
            </points>
        </group>
    )
}

function SemanticLabels({ position, label }: { position: [number, number, number], label: string }) {
    // Only difference here is finer text positioning
    return (
        <group position={position}>
            <Float speed={5} rotationIntensity={0} floatIntensity={1}>
                {/* Connecting lines to label */}
                <line>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([0, 0, 0, 8, 8, 0])} itemSize={3} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#00ff88" transparent opacity={0.5} />
                </line>

                <group position={[9, 9, 0]}>
                    <Text position={[0, 0, 0]} fontSize={1.2} color="#00ff88" font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="left" outlineWidth={0.05} outlineColor="#000000">
                        OBJECT: SPHERE_01 // {label}
                    </Text>
                    <Text position={[0, -1.5, 0]} fontSize={0.8} color="#0088ff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="left" outlineWidth={0.05} outlineColor="#000000">
                        PROB: 99.9%
                    </Text>
                </group>
            </Float>
        </group>
    )
}

function DimensionalEchoes({ position, lag, count }: { position: [number, number, number], lag: number, count: number }) {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (!groupRef.current) return
        const t = state.clock.elapsedTime

        groupRef.current.children.forEach((child, i) => {
            const mesh = child as THREE.Mesh
            mesh.rotation.y = (t + i * 0.5) * 0.2
            mesh.rotation.x = (t + i * 0.3) * 0.1
            const mat = mesh.material as THREE.MeshBasicMaterial
            mat.opacity = (0.1 + Math.sin(t * 5 + i) * 0.05) / (i + 1)
        })
    })

    return (
        <group ref={groupRef} position={position}>
            {Array.from({ length: count }).map((_, i) => (
                <mesh key={i}>
                    <torusKnotGeometry args={[8 + i * 4, 0.5, 128, 16]} />
                    <meshBasicMaterial color={i % 2 === 0 ? "#aa00ff" : "#00ffff"} wireframe transparent opacity={0.1} blending={THREE.AdditiveBlending} />
                </mesh>
            ))}
            <Text position={[0, -20, 0]} fontSize={1.2} color="#aa00ff" font="/fonts/static/Roboto-Bold.ttf">
                {`DIMENSIONAL_ECHOES (+${lag.toFixed(0)}ms)`}
            </Text>
        </group>
    )
}


function PanpsychismField({ stress }: { stress: number }) {
    // Connects the "Brain" (Center) to the "Cosmos" (Background)
    const count = 50
    const lines = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            // Random point in "Brain Space"
            const start = new THREE.Vector3((Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20, 0)
            // Random point in "Deep Space"
            const angle = Math.random() * Math.PI * 2
            const r = 50 + Math.random() * 50
            const end = new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, -50)
            temp.push({ start, end })
        }
        return temp
    }, [])

    const ref = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (!ref.current) return
        // Pulse lines
        ref.current.children.forEach((line, i) => {
            const mat = (line as THREE.Line).material as THREE.LineBasicMaterial
            mat.opacity = 0.1 + Math.sin(state.clock.elapsedTime * 2 + i) * 0.1 + stress * 0.2
        })
    })

    return (
        <group ref={ref}>
            {lines.map((l, i) => (
                <line key={i}>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={2} array={new Float32Array([...l.start.toArray(), ...l.end.toArray()])} itemSize={3} />
                    </bufferGeometry>
                    <lineBasicMaterial color="#ff00ff" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
                </line>
            ))}
        </group>
    )
}
