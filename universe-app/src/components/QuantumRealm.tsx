import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface QuantumRealmProps {
    observer?: THREE.Vector2
    entropy?: number
    isDecoding?: boolean
}

export default function QuantumRealm({ observer = new THREE.Vector2(0, 0), entropy = 0.1, isDecoding = false }: QuantumRealmProps) {
    return (
        <group>
            {/* Volumetric Wave Function Core */}
            <WaveFunctionCore observer={observer} entropy={entropy} isDecoding={isDecoding} />

            {/* Probability Density Clouds */}
            <ProbabilityCloud count={2000} chaos={entropy} />

            {/* Entanglement Web */}
            <EntanglementWeb count={8} chaos={entropy} />

            {/* Ambient Quantum Fluctuations */}
            <QuantumFluctuations count={500} />
        </group>
    )
}

function WaveFunctionCore({ observer, entropy, isDecoding }: QuantumRealmProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uN: { value: 3.0 },
            uL: { value: 2.0 },
            uM: { value: 1.0 },
            uObserver: { value: observer },
            uEntropy: { value: entropy },
            uIsDecoding: { value: isDecoding ? 1.0 : 0.0 }
        },
        vertexShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          uniform float uTime;
          uniform float uEntropy;
          
          void main() {
              vPos = position;
              vNormal = normalize(normalMatrix * normal);
              
              // Vertex jitter based on quantum instability
              vec3 glitchedPos = position + vNormal * sin(uTime * 10.0 + position.y * 5.0) * uEntropy * 0.5;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(glitchedPos, 1.0);
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          uniform float uTime;
          uniform float uN;
          uniform float uL;
          uniform float uM;
          uniform vec2 uObserver;
          uniform float uEntropy;
          uniform float uIsDecoding;

          float harmonic(vec3 pos) {
              float r = length(pos);
              float theta = acos(clamp(pos.z / (r + 0.001), -1.0, 1.0));
              float phi = atan(pos.y, pos.x);
              float wave = sin(uL * theta) * cos(uM * phi + uTime);
              float radial = exp(-r / uN) * pow(r, uL);
              return abs(wave * radial);
          }

          void main() {
              float prob = harmonic(vPos * (0.8 + 0.2 * sin(uTime * 0.5)));
              float rim = pow(1.0 - abs(dot(vNormal, vec3(0,0,1))), 2.5);
              
              vec3 coreColor = mix(vec3(0.0, 0.4, 0.8), vec3(0.8, 0.1, 1.0), sin(uTime * 0.2) * 0.5 + 0.5);
              if (uIsDecoding > 0.5) coreColor = mix(coreColor, vec3(0.0, 1.0, 0.5), sin(uTime * 10.0) * 0.5 + 0.5);

              float alpha = prob * (1.5 + uEntropy) + rim * 0.4;
              gl_FragColor = vec4(coreColor * (1.0 + rim), alpha);
          }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
        depthWrite: false
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            const mat = meshRef.current.material as THREE.ShaderMaterial;
            const t = state.clock.getElapsedTime();
            mat.uniforms.uTime.value = t;
            mat.uniforms.uObserver.value.lerp(observer ?? new THREE.Vector2(0, 0), 0.1);
            mat.uniforms.uEntropy.value = entropy ?? 0.1;

            // Cycle quantum orbitals
            const cycle = Math.floor(t / 8) % 3;
            if (cycle === 0) { // S-like
                mat.uniforms.uN.value = THREE.MathUtils.lerp(mat.uniforms.uN.value, 1.0, 0.02);
                mat.uniforms.uL.value = THREE.MathUtils.lerp(mat.uniforms.uL.value, 0.0, 0.02);
            } else if (cycle === 1) { // P-like
                mat.uniforms.uN.value = THREE.MathUtils.lerp(mat.uniforms.uN.value, 2.0, 0.02);
                mat.uniforms.uL.value = THREE.MathUtils.lerp(mat.uniforms.uL.value, 1.0, 0.02);
            } else { // D-like
                mat.uniforms.uN.value = THREE.MathUtils.lerp(mat.uniforms.uN.value, 3.0, 0.02);
                mat.uniforms.uL.value = THREE.MathUtils.lerp(mat.uniforms.uL.value, 2.0, 0.02);
            }
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[12, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

function ProbabilityCloud({ count, chaos }: { count: number, chaos: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 5 + Math.random() * 20
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            pos[i * 3 + 2] = r * Math.cos(phi)
        }
        return pos
    }, [])

    useFrame((state) => {
        if (pointsRef.current) {
            const t = state.clock.getElapsedTime();
            pointsRef.current.rotation.y = t * 0.1;
            pointsRef.current.rotation.z = t * 0.05;
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.15}
                color={chaos > 0.7 ? "#ff00ff" : "#00ffff"}
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

function EntanglementWeb({ count, chaos }: { count: number, chaos: number }) {
    return (
        <group>
            {[...Array(count)].map((_, i) => (
                <EntanglementString key={i} index={i} chaos={chaos} />
            ))}
        </group>
    )
}

function EntanglementString({ index, chaos }: { index: number, chaos: number }) {
    const curveRef = useRef<THREE.Line>(null)
    const points = useMemo(() => {
        const p = []
        for (let i = 0; i < 20; i++) p.push(new THREE.Vector3())
        return p
    }, [])

    useFrame((state) => {
        if (curveRef.current) {
            const t = state.clock.getElapsedTime();
            const start = new THREE.Vector3(
                Math.sin(t * 0.5 + index) * 10,
                Math.cos(t * 0.8 + index) * 10,
                Math.sin(t * 0.3 + index) * 10
            );
            const end = new THREE.Vector3(
                Math.cos(t * 0.4 + index * 2) * 12,
                Math.sin(t * 0.6 + index * 2) * 12,
                Math.cos(t * 0.9 + index * 2) * 12
            );

            for (let i = 0; i < 20; i++) {
                const alpha = i / 19;
                const pos = new THREE.Vector3().lerpVectors(start, end, alpha);
                const jitter = Math.sin(t * 5.0 + i * 0.5) * (0.2 + chaos * 1.5);
                pos.add(new THREE.Vector3(jitter, jitter, jitter));
                points[i].copy(pos);
            }
            curveRef.current.geometry.setFromPoints(points);
        }
    })

    return (
        <line ref={curveRef as any}>
            <bufferGeometry />
            <lineBasicMaterial color="#44ffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </line>
    )
}

function QuantumFluctuations({ count }: { count: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100
            p[i * 3 + 1] = (Math.random() - 0.5) * 100
            p[i * 3 + 2] = (Math.random() - 0.5) * 100
        }
        return p
    }, [])

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.05} color="#fff" transparent opacity={0.1} />
        </points>
    )
}
