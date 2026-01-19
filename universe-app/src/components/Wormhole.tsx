import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface WormholeProps {
    isDecoding?: boolean
}

export default function Wormhole({ isDecoding = false }: WormholeProps) {
    const count = 10000
    const instancedRef = useRef<THREE.InstancedMesh>(null)

    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const z = -Math.random() * 200
            const angle = Math.random() * Math.PI * 2
            const radius = 2 + Math.random() * 5
            temp.push({
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
                z,
                speed: 0.5 + Math.random() * 1.5,
                angle,
                radius
            })
        }
        return temp
    }, [])

    useFrame((state) => {
        if (!instancedRef.current) return
        const t = state.clock.getElapsedTime()
        const dummy = new THREE.Object3D()

        particles.forEach((p, i) => {
            const currentZ = (p.z + t * p.speed * 20) % 200 - 100
            const swirl = t * 0.5 + p.z * 0.05
            const x = Math.cos(p.angle + swirl) * p.radius
            const y = Math.sin(p.angle + swirl) * p.radius

            dummy.position.set(x, y, currentZ)

            // Stretch based on Z velocity (warp effect)
            dummy.scale.set(0.1, 0.1, 1.5)
            dummy.rotation.set(0, 0, p.angle + swirl)

            dummy.updateMatrix()
            instancedRef.current!.setMatrixAt(i, dummy.matrix)
        })
        instancedRef.current.instanceMatrix.needsUpdate = true

        if (instancedRef.current.material instanceof THREE.ShaderMaterial) {
            instancedRef.current.material.uniforms.uTime.value = t
        }
    })

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 } },
        vertexShader: `
            varying vec3 vPos;
            void main() {
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec3 vPos;
            uniform float uTime;
            void main() {
                float intensity = pow(1.0 - abs(vPos.z), 2.0);
                vec3 color = mix(vec3(0.0, 0.5, 1.0), vec3(0.5, 0.0, 1.0), sin(uTime + vPos.z) * 0.5 + 0.5);
                gl_FragColor = vec4(color, 0.6 * intensity);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])

    return (
        <group>
            {/* The Main Singular Tunnel */}
            <instancedMesh ref={instancedRef} args={[new THREE.BoxGeometry(1, 1, 1), material, count]} />

            {/* Central Glow */}
            <mesh position={[0, 0, -50]}>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="#fff" />
                <pointLight intensity={15} distance={100} color="#00ffff" />
            </mesh>

            {/* Volumetric Nebula Dust */}
            <NebulaFlow isDecoding={isDecoding} />
        </group>
    )
}

function NebulaFlow({ isDecoding }: { isDecoding: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uIsDecoding: { value: isDecoding ? 1.0 : 0.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPos;
            void main() {
                vUv = uv;
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            varying vec2 vUv;
            varying vec3 vPos;
            uniform float uTime;
            uniform float uIsDecoding;
            
            void main() {
                float pulse = sin(uTime * 2.0) * 0.5 + 0.5;
                vec3 color = mix(vec3(0.1, 0.0, 0.2), vec3(0.0, 0.8, 1.0), vUv.y);
                
                if (uIsDecoding > 0.5) {
                    float bit = step(0.9, fract(sin(dot(vPos.xy, vec2(12.9898, 78.233))) * 43758.5453));
                    if (bit > 0.5) {
                        gl_FragColor = vec4(0.0, 1.0, 0.5, 0.8);
                        return;
                    }
                }
                
                gl_FragColor = vec4(color + vec3(pulse * 0.1), 0.4);
            }
        `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false
    }), [isDecoding])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = state.clock.getElapsedTime()
            mat.uniforms.uIsDecoding.value = isDecoding ? 1.0 : 0.0
        }
    })

    return (
        <mesh ref={meshRef} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[20, 20, 200, 32, 32, true]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}
