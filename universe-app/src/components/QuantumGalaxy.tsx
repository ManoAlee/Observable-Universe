import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function QuantumGalaxy() {
    const pointsRef = useRef<THREE.Points>(null)

    // 100k "Quantum" Particles for visible mass + complex motion
    const count = 100000

    const particles = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const phases = new Float32Array(count)

        const color1 = new THREE.Color('#4400ff') // Quantum Blue
        const color2 = new THREE.Color('#ff00aa') // Plasma Pink

        for (let i = 0; i < count; i++) {
            // Spiral Parametrics
            const r = Math.random() * 20
            const spin = r * 1.5
            const angle = i + spin

            const x = Math.cos(angle) * r
            const z = Math.sin(angle) * r
            const y = (Math.random() - 0.5) * (Math.exp(-r * 0.1) * 2) // Disk thickness

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            phases[i] = Math.random() * Math.PI * 2

            // Color mixing
            const mixed = color1.clone().lerp(color2, r / 20)
            colors[i * 3] = mixed.r
            colors[i * 3 + 1] = mixed.g
            colors[i * 3 + 2] = mixed.b
        }
        return { positions, colors, phases }
    }, [])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSize: { value: 20.0 * window.devicePixelRatio }
    }), [])

    useFrame((state) => {
        if (pointsRef.current) {
            const mat = pointsRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = state.clock.getElapsedTime()
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })

    return (
        <group>
            <points ref={pointsRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={count} array={particles.positions} itemSize={3} />
                    <bufferAttribute attach="attributes-color" count={count} array={particles.colors} itemSize={3} />
                    <bufferAttribute attach="attributes-phase" count={count} array={particles.phases} itemSize={1} />
                </bufferGeometry>
                <shaderMaterial
                    vertexShader={`
          uniform float uTime;
          uniform float uSize;
          attribute float phase;
          attribute vec3 color;
          varying vec3 vColor;
          
          void main() {
            vColor = color;
            vec3 pos = position;
            
            // "Quantum" Uncertainty Principle Jitter
            float jitter = sin(uTime * 20.0 + phase * 100.0) * 0.08;
            pos += jitter * (1.0 + length(pos) * 0.1);
            
            // Relativistic Frame Dragging Simulation near a Kerr-like BH
            float angle = atan(pos.z, pos.x);
            float dist = length(pos.xz);
            float rotation = uTime * (3.0 / (dist + 0.1));
            pos.x = cos(angle + rotation) * dist;
            pos.z = sin(angle + rotation) * dist;
            
            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = uSize * (1.5 / -mvPosition.z) * (0.8 + sin(uTime + phase) * 0.2);
            gl_Position = projectionMatrix * mvPosition;
          }
        `}
                    fragmentShader={`
          varying vec3 vColor;
          void main() {
             vec2 uv = gl_PointCoord - vec2(0.5);
             float dist = length(uv);
             if (dist > 0.5) discard;
             
             // Quantum Probability Cloud Glow
             float glow = pow(1.0 - dist * 2.0, 2.0);
             gl_FragColor = vec4(vColor * 2.0, glow);
          }
        `}
                    uniforms={uniforms}
                    transparent
                    depthWrite={false}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Central Singularity: The Galactic Black Hole */}
            <mesh>
                <sphereGeometry args={[0.5, 32, 32]} />
                <meshBasicMaterial color="black" />
                <group rotation={[Math.PI / 2.5, 0.2, 0]}>
                    <mesh>
                        <ringGeometry args={[0.6, 5.0, 128]} />
                        <shaderMaterial
                            transparent
                            side={THREE.DoubleSide}
                            uniforms={{ uTime: { value: 0 } }}
                            vertexShader={`
                          varying vec2 vUv;
                          void main() {
                              vUv = uv;
                              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                          }
                      `}
                            fragmentShader={`
                          varying vec2 vUv;
                          uniform float uTime;
                          void main() {
                              float dist = length(vUv - 0.5);
                              float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
                              
                              // Accretion disk flow (Relativistic Beaming)
                              float flow = sin(angle * 8.0 - uTime * 15.0) * 0.5 + 0.5;
                              float ring = smoothstep(0.1, 0.45, dist) * (1.0 - smoothstep(0.48, 0.5, dist));
                              
                              vec3 color = mix(vec3(1.0, 0.2, 0.0), vec3(1.0, 1.0, 0.5), flow);
                              gl_FragColor = vec4(color * 3.0, ring * (0.4 + flow * 0.6));
                          }
                      `}
                        />
                    </mesh>
                </group>
            </mesh>
        </group>
    )
}
