import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// CodeRain component: streams of scrolling code resembling classic Matrix rain
function CodeRain({ anomaly }: { anomaly: boolean }) {
    const count = 200;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Random positions for each rain column
    const positions = useMemo(() =>
        new Array(count).fill(0).map(() => ({
            x: (Math.random() - 0.5) * 80,
            y: Math.random() * 100 + 20,
            z: (Math.random() - 0.5) * 80,
        })), [count]
    );

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColor: { value: new THREE.Color(anomaly ? '#ff0000' : '#00ff44') },
        },
        vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
      }
    `,
        fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      uniform vec3 uColor;
      void main() {
        vec2 st = vUv;
        st.y += uTime * 2.0;
        float char = step(0.7, fract(sin(st.x * 10.0 + uTime) * 0.5 + 0.5));
        gl_FragColor = vec4(uColor * char, char * 0.6);
      }
    `,
        transparent: true,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
    }), [anomaly]);

    useFrame((state) => {
        if (material) {
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
        if (meshRef.current) {
            positions.forEach((p, i) => {
                dummy.position.set(p.x, p.y, p.z);
                dummy.scale.set(0.5, 5, 0.5);
                dummy.updateMatrix();
                meshRef.current!.setMatrixAt(i, dummy.matrix);
            });
            meshRef.current.instanceMatrix.needsUpdate = true;
        }
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[0.5, 5, 0.5]} />
            <primitive object={material} attach="material" />
        </instancedMesh>
    );
}

export default CodeRain;
