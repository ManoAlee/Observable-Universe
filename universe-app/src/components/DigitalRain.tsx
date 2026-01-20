import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DigitalRainProps {
    intensity: number
    observer: THREE.Vector2
}

export default function DigitalRain({ intensity, observer }: DigitalRainProps) {
    // OPTIMIZATION: Reduced count from 150x40 (6000) to 100x30 (3000)
    // We can achieve the same "look" with fewer, larger, brighter particles
    const count = 100
    const particlesPerColumn = 30
    const totalCount = count * particlesPerColumn
    const pointsRef = useRef<THREE.Points>(null)

    const [positions, offsets, speeds] = useMemo(() => {
        const pos = new Float32Array(totalCount * 3)
        const off = new Float32Array(totalCount)
        const spd = new Float32Array(totalCount)

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 120 // Wider spread
            const z = (Math.random() - 0.5) * 120
            const columnSpeed = 0.5 + Math.random() * 1.5
            const columnOffset = Math.random() * 100

            for (let j = 0; j < particlesPerColumn; j++) {
                const idx = i * particlesPerColumn + j
                pos[idx * 3] = x
                pos[idx * 3 + 1] = (j / particlesPerColumn) * 100 - 50
                pos[idx * 3 + 2] = z

                off[idx] = columnOffset + j * 0.5
                spd[idx] = columnSpeed
            }
        }
        return [pos, off, spd]
    }, [])

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uIntensity: { value: intensity },
        uObserver: { value: observer },
        uChaos: { value: 0 }
    }), [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (pointsRef.current) {
            const mat = pointsRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = t
            mat.uniforms.uIntensity.value = intensity
            mat.uniforms.uObserver.value.copy(observer)
            mat.uniforms.uChaos.value = intensity
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={totalCount} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-offset" count={totalCount} array={offsets} itemSize={1} />
                <bufferAttribute attach="attributes-speed" count={totalCount} array={speeds} itemSize={1} />
            </bufferGeometry>
            <shaderMaterial
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={uniforms}
                vertexShader={`
                    uniform float uTime;
                    uniform float uIntensity;
                    attribute float offset;
                    attribute float speed;
                    varying float vAlpha;
                    varying float vIsHead;

                    void main() {
                        // Falling logic
                        float y = position.y;
                        float fallSpeed = speed * (1.0 + uIntensity * 1.5);
                        y = mod(y - uTime * fallSpeed * 8.0 + offset, 100.0) - 50.0;
                        
                        vec3 finalPos = vec3(position.x, y, position.z);
                        
                        // Interaction: Repel from center gently
                        float dist = length(finalPos.xz);
                        if (dist < 20.0) {
                            finalPos.y += sin(uTime * 3.0 + dist) * 2.0 * uIntensity;
                        }

                        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                        
                        // Closer to top of column = brighter "head"
                        float relY = mod(y + uTime * fallSpeed * 8.0 - offset, 100.0);
                        vAlpha = pow(relY / 100.0, 4.0); // Sharper falloff
                        vIsHead = step(0.97, relY / 100.0);

                        // Size attenuation
                        gl_PointSize = (vIsHead > 0.5 ? 6.0 : 3.0) * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `}
                fragmentShader={`
                    uniform float uTime;
                    uniform float uChaos;
                    varying float vAlpha;
                    varying float vIsHead;
                    
                    float hash(vec2 p) {
                        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                    }

                    void main() {
                        // Circular particle
                        vec2 uv = gl_PointCoord;
                        float d = length(uv - 0.5);
                        if(d > 0.5) discard;

                        // Digital color logic
                        vec3 color = vec3(0.0, 1.0, 0.4); // Matrix Green
                        // Chaos introduces red glitching
                        if (uChaos > 0.7 && hash(uv + uTime) > 0.9) {
                            color = vec3(1.0, 0.0, 0.0);
                        }

                        // Character simulation (flicker)
                        float flicker = 0.8 + 0.2 * sin(uTime * 30.0);
                        
                        vec3 finalColor = color * vAlpha * flicker;
                        if (vIsHead > 0.5) {
                            finalColor = mix(vec3(1.0), color, 0.2); // White-hot head
                        }
                        
                        gl_FragColor = vec4(finalColor, vAlpha * (1.0 - d * 2.0));
                    }
                `}
            />
        </points>
    )
}

