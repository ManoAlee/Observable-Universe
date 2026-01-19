import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface DigitalRainProps {
    intensity: number
    observer: THREE.Vector2
}

export default function DigitalRain({ intensity, observer }: DigitalRainProps) {
    const count = 150 // Number of columns
    const particlesPerColumn = 40
    const totalCount = count * particlesPerColumn
    const pointsRef = useRef<THREE.Points>(null)

    const [positions, offsets, speeds] = useMemo(() => {
        const pos = new Float32Array(totalCount * 3)
        const off = new Float32Array(totalCount)
        const spd = new Float32Array(totalCount)

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 100
            const z = (Math.random() - 0.5) * 100
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
            mat.uniforms.uChaos.value = intensity // Using intensity as chaos proxy
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
                    uniform float uChaos;
                    attribute float offset;
                    attribute float speed;
                    varying vec3 vPos;
                    varying float vAlpha;
                    varying float vIsHead;

                    void main() {
                        vPos = position;
                        
                        // Falling logic
                        float y = position.y;
                        float fallSpeed = speed * (1.0 + uIntensity * 2.0);
                        y = mod(y - uTime * fallSpeed * 10.0 + offset, 100.0) - 50.0;
                        
                        vec3 finalPos = vec3(position.x, y, position.z);
                        
                        // Interaction distortion
                        float dist = distance(finalPos.xz, vec2(0.0));
                        finalPos.y += sin(uTime * 2.0 + dist * 0.1) * uIntensity * 2.0;

                        vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                        
                        // Closer to top of column = brighter "head"
                        float relY = mod(y + uTime * fallSpeed * 10.0 - offset, 100.0);
                        vAlpha = pow(relY / 100.0, 3.0);
                        vIsHead = step(0.98, relY / 100.0);

                        gl_PointSize = (vIsHead > 0.5 ? 4.0 : 2.5) * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `}
                fragmentShader={`
                    uniform float uTime;
                    uniform float uIntensity;
                    uniform float uChaos;
                    varying vec3 vPos;
                    varying float vAlpha;
                    varying float vIsHead;
                    
                    float hash(vec2 p) {
                        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
                    }

                    void main() {
                        vec2 uv = gl_PointCoord;
                        float d = length(uv - 0.5);
                        if(d > 0.5) discard;

                        // Digital color logic
                        vec3 color = vec3(0.0, 1.0, 0.3); // Matrix Green
                        if (uChaos > 0.7) {
                            color = mix(color, vec3(1.0, 0.1, 0.1), (uChaos - 0.7) * 3.3); // Fade to red on high chaos
                        }

                        // Character simulation
                        float c = hash(floor(vPos.xy * 10.0) + floor(uTime * 15.0));
                        float charMask = step(0.5, c);
                        
                        vec3 finalColor = color * vAlpha;
                        if (vIsHead > 0.5) {
                            finalColor = vec3(1.0); // White head for the "lead" character
                        }

                        // Add some flicker
                        float flicker = 0.8 + 0.2 * sin(uTime * 20.0 + vPos.x);
                        
                        gl_FragColor = vec4(finalColor * flicker, vAlpha * (1.0 - d * 2.0));
                    }
                `}
            />
        </points>
    )
}

