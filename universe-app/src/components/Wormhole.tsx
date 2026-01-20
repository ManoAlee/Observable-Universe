import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WormholeProps {
    isDecoding?: boolean
    chaos?: number
}

export default function Wormhole({ isDecoding = false, chaos = 0 }: WormholeProps) {
    // REDUCED COUNT for Performance (was 10000)
    const count = 4000
    const instancedRef = useRef<THREE.InstancedMesh>(null)
    const diskRef = useRef<THREE.Mesh>(null)

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const z = -Math.random() * 200
            const angle = Math.random() * Math.PI * 2
            // Distribution: More dense near the center (Event Horizon)
            const radius = 3 + Math.random() * Math.random() * 20
            temp.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z,
                speed: 0.2 + Math.random() * 0.8,
                angle,
                radius,
                scale: Math.random()
            })
        }
        return temp
    }, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()

        // 1. Particle Tunnel Animation
        if (instancedRef.current) {
            const dummy = new THREE.Object3D()
            particles.forEach((p, i) => {
                // Chaos increases speed and jitter
                const speedMult = 1.0 + chaos * 2.0
                const currentZ = (p.z + t * p.speed * 20 * speedMult) % 200 - 50

                // Vortex Twist + Chaos Jitter
                const swirl = currentZ * 0.1
                const jitter = (Math.random() - 0.5) * chaos * 0.5

                const x = Math.cos(p.angle + swirl) * (p.radius + jitter)
                const y = Math.sin(p.angle + swirl) * (p.radius + jitter)

                dummy.position.set(x, y, currentZ)

                // Relativistic Stretch: Particles stretch as they move faster/deeper
                const stretch = 1.0 + Math.abs(currentZ) * 0.05
                dummy.scale.set(0.1 * p.scale, 0.1 * p.scale, stretch * p.scale)
                dummy.rotation.set(0, 0, p.angle + swirl)

                dummy.updateMatrix()
                instancedRef.current!.setMatrixAt(i, dummy.matrix)
            })
            instancedRef.current.instanceMatrix.needsUpdate = true
        }

        // 2. Accretion Disk Shader Update
        if (diskRef.current) {
            const mat = diskRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = t
            mat.uniforms.uChaos.value = chaos
        }
    })

    // OPTIMIZED SHADER: Uses vertex coloring for variety without extra uniforms
    const particleMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    }), [])

    return (
        <group>
            {/* The Warp Tunnel */}
            <instancedMesh ref={instancedRef} args={[new THREE.BoxGeometry(1, 1, 1), particleMaterial, count]} />

            {/* REALISTIC ACCRETION DISK */}
            <AccretionDisk ref={diskRef} chaos={chaos} />

            {/* Event Horizon Black Hole */}
            <mesh position={[0, 0, -2]}>
                <sphereGeometry args={[2.8 * (1 - chaos * 0.1), 64, 64]} />
                <meshBasicMaterial color="#000000" />
            </mesh>

            {/* Gravitational Lens distortion helper (Glow) */}
            <mesh position={[0, 0, -2.1]}>
                <ringGeometry args={[2.8, 3.2 + chaos, 64]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.5} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
            </mesh>
        </group>
    )
}

const AccretionDisk = React.forwardRef<THREE.Mesh, { chaos: number }>(({ chaos }, ref) => {
    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColorInner: { value: new THREE.Color('#ffaa00') },
            uColorOuter: { value: new THREE.Color('#aa00ff') },
            uChaos: { value: chaos }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vElev;
            uniform float uTime;
            uniform float uChaos;
            
            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Swirling motion geometry
                float angle = atan(pos.y, pos.x);
                float radius = length(pos.xy);
                
                // Rotate based on radius (Keplerian-ish differential rotation)
                float rotation = uTime * (5.0 / radius);
                
                float c = cos(rotation);
                float s = sin(rotation);
                
                vec3 rotatedPos = vec3(
                    pos.x * c - pos.y * s,
                    pos.x * s + pos.y * c,
                    pos.z
                );
                
                // Chaos distortion (Vertical displacement)
                rotatedPos.z += sin(rotation * 3.0 + uTime) * uChaos * 2.0;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(rotatedPos, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColorInner;
            uniform vec3 uColorOuter;
            uniform float uChaos;

            float noise(vec2 p) {
                return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void main() {
                // Radial gradient
                vec2 center = vec2(0.5);
                float dist = distance(vUv, center) * 2.0; // 0 to 1
                
                // Ring texture
                float ring = sin(dist * 40.0 - uTime * 2.0 + uChaos * 10.0);
                float ringNoise = noise(vUv * 10.0 + uTime);
                
                float brightness = (ring * 0.5 + 0.5) * ringNoise;
                
                // Color Mix - Chaos turns it Red
                vec3 finalInner = mix(uColorInner, vec3(1.0, 0.0, 0.0), uChaos);
                vec3 finalOuter = mix(uColorOuter, vec3(0.5, 0.0, 0.0), uChaos);
                
                vec3 color = mix(finalInner, finalOuter, dist);
                
                // Fade edges
                float alpha = smoothstep(0.3, 0.4, dist) * (1.0 - smoothstep(0.8, 1.0, dist));
                
                gl_FragColor = vec4(color * brightness * (2.0 + uChaos * 5.0), alpha * 0.8);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame(() => {
        material.uniforms.uChaos.value = chaos
    })

    return (
        <mesh ref={ref} rotation={[Math.PI / 3, 0, 0]} position={[0, 0, 0]}>
            <planeGeometry args={[25, 25, 128, 128]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
})
