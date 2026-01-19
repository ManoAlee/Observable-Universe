import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

interface NeuralSymbiosisProps {
    observer: THREE.Vector2
    intensity: number
}

export default function NeuralSymbiosis({ observer, intensity }: NeuralSymbiosisProps) {
    const count = 2000
    const pointsRef = useRef<THREE.Points>(null)
    const linesRef = useRef<THREE.LineSegments>(null)

    const [positions, connections, colors] = useMemo(() => {
        const pos = new Float32Array(count * 3)
        const conn = []
        const cols = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 40 + Math.random() * 40
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            pos[i * 3 + 2] = r * Math.cos(phi)

            cols[i * 3] = 0.2 + Math.random() * 0.3
            cols[i * 3 + 1] = 0.5 + Math.random() * 0.5
            cols[i * 3 + 2] = 1.0

            // High-density synaptic mapping
            const connectionsPerNeuron = 3
            for (let c = 0; c < connectionsPerNeuron; c++) {
                if (Math.random() > 0.95) {
                    const target = Math.floor(Math.random() * count)
                    conn.push(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2])
                    conn.push(pos[target * 3], pos[target * 3 + 1], pos[target * 3 + 2])
                }
            }
        }
        return [pos, new Float32Array(conn), cols]
    }, [])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uObserver: { value: new THREE.Vector3() },
        uIntensity: { value: intensity }
    }), [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (pointsRef.current) {
            pointsRef.current.rotation.y = t * 0.03
            pointsRef.current.rotation.z = t * 0.01
        }
        if (linesRef.current) {
            linesRef.current.rotation.y = t * 0.03
            linesRef.current.rotation.z = t * 0.01
            const mat = linesRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = t
            mat.uniforms.uIntensity.value = intensity
            const observerV3 = new THREE.Vector3(observer.x * 50, observer.y * 50, 0)
            mat.uniforms.uObserver.value.lerp(observerV3, 0.05)
        }
    })

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
                </bufferGeometry>
                <PointMaterial size={0.4} vertexColors transparent opacity={0.6} sizeAttenuation blending={THREE.AdditiveBlending} />
            </points>

            <lineSegments ref={linesRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={connections.length / 3} array={connections} itemSize={3} />
                </bufferGeometry>
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    uniforms={uniforms}
                    vertexShader={`
                        varying float vDist;
                        varying vec3 vPos;
                        uniform vec3 uObserver;
                        void main() {
                            vPos = (modelMatrix * vec4(position, 1.0)).xyz;
                            vDist = distance(vPos, uObserver);
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying float vDist;
                        varying vec3 vPos;
                        uniform float uTime;
                        uniform float uIntensity;
                        void main() {
                            float pulse = sin(vDist * 0.2 - uTime * 4.0) * 0.5 + 0.5;
                            float wave = sin(length(vPos) * 0.1 + uTime);
                            
                            // Reaction to observer proximity
                            float reaction = smoothstep(40.0, 0.0, vDist);
                            
                            vec3 coreColor = mix(vec3(0.1, 0.4, 1.0), vec3(0.0, 1.0, 0.8), wave * 0.5 + 0.5);
                            vec3 activeColor = mix(coreColor, vec3(1.0, 0.9, 0.3), reaction * uIntensity);
                            
                            float alpha = pulse * 0.3 * (0.2 + reaction * 2.0);
                            gl_FragColor = vec4(activeColor, alpha);
                        }
                    `}
                />
            </lineSegments>
        </group>
    )
}
