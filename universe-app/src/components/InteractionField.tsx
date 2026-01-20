import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface InteractionFieldProps {
    observer: THREE.Vector2
    intensity?: number
}

/**
 * Visualizes the "Observer Effect" field.
 * Represents the collapse of probability waves around the point of observation.
 */
export default function InteractionField({ observer, intensity = 1.0 }: InteractionFieldProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Shader to create a "digital distortion" ripple effect
    const material = React.useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: new THREE.Vector2(0, 0) },
            uIntensity: { value: intensity }
        },
        vertexShader: `
            varying vec2 vUv;
            varying float vDist;
            uniform vec2 uObserver;
            uniform float uTime;

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Map Observer (Screen space -1 to 1) to World Space (Approx)
                vec3 obsWorld = vec3(uObserver.x * 20.0, uObserver.y * 10.0, 0.0);
                
                float d = distance(pos, obsWorld);
                vDist = d;
                
                // Ripple effect based on distance to observer
                float ripple = sin(d * 2.0 - uTime * 5.0) * exp(-d * 0.2);
                
                pos.z += ripple * 2.0;
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            varying float vDist;
            uniform float uTime;
            uniform float uIntensity;

            void main() {
                // Fades out at distance
                float alpha = exp(-vDist * 0.15) * 0.5;
                
                // Grid lines logic (simple)
                float grid = step(0.95, fract(vDist * 2.0));
                
                vec3 color = mix(vec3(0.0, 0.0, 0.0), vec3(0.0, 1.0, 1.0), grid * alpha * uIntensity);
                
                if (alpha < 0.01) discard;
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = state.clock.getElapsedTime()
            mat.uniforms.uObserver.value.lerp(observer, 0.2) // Increased interp speed for responsiveness
        }
    })

    return (
        <mesh ref={meshRef} position={[0, 0, -5]} rotation={[-Math.PI / 6, 0, 0]}>
            <planeGeometry args={[60, 40, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}
