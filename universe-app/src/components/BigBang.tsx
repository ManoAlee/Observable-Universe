import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function BigBang({ time }: { time: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const plasmaRef = useRef<THREE.Points>(null)

    const H0 = 70.0
    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uExpansion: { value: 0 },
        uChaos: { value: 0 }
    }), [])

    const plasmaParticles = useMemo(() => {
        const count = 5000
        const pos = new Float32Array(count * 3)
        const sizes = new Float32Array(count)
        for (let i = 0; i < count; i++) {
            const r = Math.random()
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            pos[i * 3 + 2] = r * Math.cos(phi)
            sizes[i] = Math.random()
        }
        return { pos, sizes }
    }, [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = time

            let expansionFactor = time < 1.0 ? Math.pow(Math.max(0.001, time), 0.5) :
                time < 10.0 ? Math.pow(time, 0.66) :
                    Math.pow(10.0, 0.66) * Math.exp(0.1 * (time - 10.0));

            mat.uniforms.uExpansion.value = expansionFactor
            const scale = expansionFactor * (time < 0.5 ? 8 : 25)
            meshRef.current.scale.setScalar(scale)

            if (plasmaRef.current) {
                plasmaRef.current.scale.setScalar(scale * 0.95)
                plasmaRef.current.rotation.y = t * 0.5
            }
        }
    })

    return (
        <group>
            {/* Primordial Singularity & CMB Surface */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[1, 128, 128]} />
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    uniforms={uniforms}
                    vertexShader={`
                        varying vec3 vNormal;
                        varying vec3 vPos;
                        uniform float uTime;
                        uniform float uExpansion;

                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            vPos = position;
                            
                            vec3 p = position;
                            // Inflationary turbulence
                            float noise = sin(p.x * 5.0 + uTime * 20.0) * cos(p.y * 5.0 + uTime * 15.0);
                            p += normal * noise * (0.2 / (uTime * 0.5 + 0.1));
                            
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec3 vNormal;
                        varying vec3 vPos;
                        uniform float uTime;
                        uniform float uExpansion;

                        float noise(vec3 p) {
                            return fract(sin(dot(p, vec3(12.9898, 78.233, 45.432))) * 43758.5453);
                        }

                        void main() {
                            float fresnel = pow(1.0 - dot(vNormal, vec3(0,0,1)), 3.0);
                            
                            // Primordial Temperature 
                            float temp = 1.0 / (uExpansion * 10.0 + 0.1);
                            vec3 color = mix(vec3(0.05, 0.05, 0.1), vec3(1.0, 0.6, 0.2), temp * 2.0);
                            color = mix(color, vec3(0.8, 0.9, 1.0), pow(temp, 4.0)); // Pure Singularity White/Blue

                            // Plasma turbulence texture
                            float n = noise(vPos * 5.0 + uTime * 2.0);
                            color += n * 0.1 * temp;

                            gl_FragColor = vec4(color + vec3(fresnel * 0.5), (1.0 - uTime * 0.01) * (0.8 + fresnel));
                        }
                    `}
                />
            </mesh>

            {/* Internal High-Energy Plasma Particles */}
            <points ref={plasmaRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" count={5000} array={plasmaParticles.pos} itemSize={3} />
                    <bufferAttribute attach="attributes-size" count={5000} array={plasmaParticles.sizes} itemSize={1} />
                </bufferGeometry>
                <shaderMaterial
                    transparent
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    uniforms={uniforms}
                    vertexShader={`
                        attribute float size;
                        varying float vAlpha;
                        uniform float uTime;
                        void main() {
                            vec3 p = position;
                            float t = uTime * 2.0;
                            // Centrifugal plasma flow
                            p *= (1.0 + sin(t + length(position) * 5.0) * 0.1);
                            vAlpha = size * (1.0 - uTime * 0.05);
                            vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
                            gl_PointSize = size * (200.0 / -mvPosition.z) * (1.0 / (uTime * 0.2 + 1.0));
                            gl_Position = projectionMatrix * mvPosition;
                        }
                    `}
                    fragmentShader={`
                        varying float vAlpha;
                        void main() {
                            float d = length(gl_PointCoord - 0.5);
                            if (d > 0.5) discard;
                            gl_FragColor = vec4(vec3(1.0, 0.8, 0.4), vAlpha * (1.0 - d * 2.0));
                        }
                    `}
                />
            </points>
        </group>
    )
}

