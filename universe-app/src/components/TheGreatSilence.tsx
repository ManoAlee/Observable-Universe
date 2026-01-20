import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Billboard, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function TheGreatSilence({ entropy = 0 }: { entropy?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const staticRef = useRef<THREE.Points>(null);

    // Shader for the "Static/Noise" of the void
    const staticMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uEntropy: { value: entropy },
            uColor: { value: new THREE.Color('#00ffff') }
        },
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 4.0 * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,

        fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform float uEntropy;
      uniform vec3 uColor;

      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        float noise = random(vUv + uTime * 0.1);
        float threshold = 0.95 - (uEntropy * 0.1);
        if (noise < threshold) discard;
        gl_FragColor = vec4(uColor, 0.8);
      }

    `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [entropy]);

    // Main Void Sphere Shader
    const voidShader = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uEntropy: { value: entropy }
        },
        vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float uTime;
      uniform float uEntropy;

      void main() {
        float eye = max(0.0, dot(vNormal, vec3(0.0, 0.0, 1.0)));
        float glow = pow(1.0 - eye, 3.0);
        vec3 color = mix(vec3(0.0, 0.05, 0.1), vec3(0.0, 0.8, 1.0), glow);
        
        // Scanlines/Static interference
        float scanline = sin(vPosition.y * 20.0 + uTime * 10.0) * 0.1;
        color += scanline * uEntropy;

        gl_FragColor = vec4(color, 0.8);
      }
    `,
        transparent: true,
        side: THREE.BackSide
    }), [entropy]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.05;
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
        }
        if (staticRef.current) {
            (staticRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
        }
    });

    return (
        <group>
            {/* Background Static (The Noise of Empty Space) */}
            <points ref={staticRef}>
                <sphereGeometry args={[100, 64, 64]} />
                <primitive object={staticMaterial} attach="material" />
            </points>

            {/* The Central Void (Dyson Sphere / Dead Star) */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[40, 64, 64]} />
                <primitive object={voidShader} attach="material" />
            </mesh>

            <mesh scale={[0.5, 0.5, 0.5]}>
                <sphereGeometry args={[10, 32, 32]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
                <pointLight intensity={10} distance={100} color="#00ffff" />
            </mesh>

            {/* Floating Labels */}
            <Float speed={1} rotationIntensity={0.5} floatIntensity={0.5}>
                <Billboard position={[0, 50, 0]}>
                    <Text
                        fontSize={6}
                        color="#ff4444"
                        font="/fonts/static/Roboto-Bold.ttf"
                        maxWidth={200}
                        textAlign="center"
                    >
                        THE GREAT SILENCE
                    </Text>
                    <Text
                        position={[0, -5, 0]}
                        fontSize={2}
                        color="#ffffff"
                        fillOpacity={0.8}
                        font="/fonts/static/Roboto-Bold.ttf"
                    >
                        FERMI_PARADOX // ERROR_NO_RESPONSE
                    </Text>
                </Billboard>
            </Float>


            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#00ffff" />
        </group>
    );
}
