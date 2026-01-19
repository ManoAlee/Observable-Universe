import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SingularityProps {
    isDecoding?: boolean
}

export default function InformationSingularity({ isDecoding = false }: SingularityProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
        },
        vertexShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          void main() {
              vPos = position;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
      `,
        fragmentShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          uniform float uTime;

          // Hash function for random positioning
          float hash(float n) { return fract(sin(n) * 43758.5453123); }
          vec3 hash3(float n) { return vec3(hash(n), hash(n+1.0), hash(n+2.0)); }

          void main() {
              vec3 p = vPos * 0.05;
              float bubbleField = 0.0;
              
              // Simulate 10 bubble universes emerging and merging
              for(int i=0; i<10; i++) {
                  float fi = float(i);
                  vec3 offset = (hash3(fi * 123.45) - 0.5) * 20.0;
                  // Dynamic movement based on time
                  offset.x += sin(uTime * 0.1 + fi) * 5.0;
                  offset.y += cos(uTime * 0.15 + fi * 1.5) * 5.0;
                  offset.z += sin(uTime * 0.05 - fi * 2.0) * 5.0;
                  
                  float dist = length(p - offset);
                  // Soft bubble edge using smoothstep
                  float size = 3.0 + sin(uTime * 0.2 + fi) * 1.0;
                  bubbleField += smoothstep(size, size - 1.0, dist);
              }
              
              // Color based on field intensity and distance
              vec3 colorA = vec3(0.02, 0.0, 0.05); // Deeper Void
              vec3 colorB = vec3(0.0, 0.6, 1.0); // Smoother Inflation
              vec3 colorC = vec3(1.0, 0.2, 0.5); // Radiant Reality Birth
              
              vec3 finalColor = mix(colorA, colorB, smoothstep(0.0, 1.0, bubbleField));
              finalColor = mix(finalColor, colorC, smoothstep(1.0, 2.0, bubbleField));
              
              // Add a rim glow effect
              float rim = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 3.0);
              finalColor += rim * 0.5 * bubbleField;

              gl_FragColor = vec4(finalColor, clamp(bubbleField * 0.5, 0.0, 0.8));
          }
      `,
        transparent: true,
        side: THREE.BackSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime()
            meshRef.current.rotation.y += 0.0005
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[200, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}
