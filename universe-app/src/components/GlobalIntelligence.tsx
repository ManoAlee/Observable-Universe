import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function GlobalIntelligence({ entropy = 0, mouse = new THREE.Vector2() }: { entropy?: number, mouse?: THREE.Vector2 }) {
    const meshRef = useRef<THREE.Points>(null);
    const count = 1000;

    // A subtle global grid of data points that reacts to intelligence/entropy
    const particles = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 500;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 500;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 500;
            sizes[i] = Math.random();
        }
        return { pos, sizes };
    }, [count]);

    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uEntropy: { value: entropy },
            uMouse: { value: mouse },
            uColor: { value: new THREE.Color('#00f2ff') }
        },
        vertexShader: `
            attribute float size;
            varying float vSize;
            uniform float uTime;
            uniform vec2 uMouse;
            void main() {
                vSize = size;
                vec3 pos = position;
                
                // Subtle flow
                pos.x += sin(uTime * 0.1 + pos.z * 0.05) * 5.0;
                pos.y += cos(uTime * 0.1 + pos.x * 0.05) * 5.0;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying float vSize;
            uniform vec3 uColor;
            uniform float uTime;
            void main() {
                float dist = distance(gl_PointCoord, vec2(0.5));
                if (dist > 0.5) discard;
                
                float pulse = 0.5 + 0.5 * sin(uTime * 2.0 + vSize * 10.0);
                gl_FragColor = vec4(uColor, (1.0 - dist * 2.0) * pulse * 0.3);
            }
        `,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [entropy]);

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.elapsedTime;
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uMouse.value.lerp(mouse, 0.1);
        }
    });

    return (
        <points ref={meshRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={particles.pos} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={count} array={particles.sizes} itemSize={1} />
            </bufferGeometry>
            <primitive object={shaderMaterial} attach="material" />
        </points>
    );
}
