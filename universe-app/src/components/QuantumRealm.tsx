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

            {/* Probability Density Clouds - Upgraded to Volumetric Clusters */}
            <ProbabilityCloudCluster count={200} chaos={entropy} />

            {/* Entanglement Web */}
            <EntanglementWeb count={8} chaos={entropy} />

            {/* Ambient Quantum Fluctuations */}
            <QuantumFluctuations count={1000} />
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
          varying vec3 vViewDir;
          uniform float uTime;
          uniform float uEntropy;
          
          void main() {
              vPos = position;
              vec3 deformedPos = position;
              
              // Schrödinger breathing
              float breath = sin(uTime * 2.0 + position.y * 0.2) * 2.0;
              deformedPos += normal * breath * 0.1 * (1.0 + uEntropy);
              
              vNormal = normalize(normalMatrix * normal);
              vec4 mvPos = modelViewMatrix * vec4(deformedPos, 1.0);
              vViewDir = normalize(-mvPos.xyz);
              gl_Position = projectionMatrix * mvPos;
          }
        `,
        fragmentShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          varying vec3 vViewDir;
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
              float wave = sin(uL * theta + uTime) * cos(uM * phi - uTime * 0.5);
              float radial = exp(-r / uN) * pow(r, uL);
              return abs(wave * radial);
          }

          void main() {
              float prob = harmonic(vPos * 0.1);
              float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
              
              // Quantum superposition colors
              vec3 stateA = vec3(0.0, 1.0, 1.0); // Cyan
              vec3 stateB = vec3(1.0, 0.0, 1.0); // Magenta
              vec3 color = mix(stateA, stateB, prob + sin(uTime) * 0.5 + 0.5);
              
              if (uIsDecoding > 0.5) {
                  color = mix(color, vec3(0.0, 1.0, 0.0), 0.5);
              }

              // Glow intensity based on probability density
              float alpha = smoothstep(0.0, 1.0, prob * 2.0) + fresnel * 0.8;
              
              gl_FragColor = vec4(color * (1.0 + fresnel * 2.0), clamp(alpha, 0.0, 0.8));
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
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[20, 128, 128]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

// Replaces point cloud with "Volumetric" sprites for better density visualization
function ProbabilityCloudCluster({ count, chaos }: { count: number, chaos: number }) {
    const instancedRef = useRef<THREE.InstancedMesh>(null)
    const particleData = useMemo(() => Array.from({ length: count }).map(() => ({
        pos: new THREE.Vector3().randomDirection().multiplyScalar(15 + Math.random() * 30),
        scale: Math.random() * 5 + 2,
        phase: Math.random() * Math.PI * 2
    })), [])

    useFrame((state) => {
        if (!instancedRef.current) return
        const t = state.clock.getElapsedTime()
        const dummy = new THREE.Object3D()

        particleData.forEach((p, i) => {
            // Orbital drift
            const angle = p.phase + t * 0.1 * (chaos + 0.5)
            const r = p.pos.length()
            dummy.position.set(
                Math.cos(angle) * r,
                Math.sin(angle * 0.8) * r * 0.5,
                Math.sin(angle) * r
            )
            dummy.rotation.set(t * 0.2, t * 0.1, 0)
            const pulsate = 1.0 + Math.sin(t * 2.0 + p.phase) * 0.3
            dummy.scale.setScalar(p.scale * pulsate)
            dummy.updateMatrix()
            instancedRef.current.setMatrixAt(i, dummy.matrix)
        })
        instancedRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={instancedRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#4400ff" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
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
        for (let i = 0; i < 40; i++) p.push(new THREE.Vector3())
        return p
    }, [])

    useFrame((state) => {
        if (curveRef.current) {
            const t = state.clock.getElapsedTime();
            // Complex Lissajous figures for entanglement paths
            const start = new THREE.Vector3(
                Math.sin(t * 0.3 + index) * 25,
                Math.cos(t * 0.4 + index) * 25,
                Math.sin(t * 0.2 + index) * 25
            );
            const end = new THREE.Vector3(
                Math.sin(t * 0.5 + index * 2) * 30,
                Math.cos(t * 0.6 + index * 2) * 30,
                Math.sin(t * 0.7 + index * 2) * 30
            );

            for (let i = 0; i < 40; i++) {
                const alpha = i / 39;
                // Cubic Bezier interpolation logic manually
                const p1 = start.clone().lerp(end, 0.33).add(new THREE.Vector3(Math.sin(t), Math.cos(t), 0).multiplyScalar(10))
                const p2 = start.clone().lerp(end, 0.66).add(new THREE.Vector3(Math.cos(t), Math.sin(t), 0).multiplyScalar(-10))

                // Simple Catmull-Rom spline approximation
                const pos = new THREE.Vector3().lerpVectors(start, end, alpha)
                pos.add(new THREE.Vector3(
                    Math.sin(alpha * Math.PI * 2.0 + t) * 5.0,
                    Math.cos(alpha * Math.PI * 4.0 + t) * 5.0,
                    Math.sin(alpha * Math.PI * 3.0 + t) * 5.0
                ))

                points[i].copy(pos);
            }
            curveRef.current.geometry.setFromPoints(points);
        }
    })

    return (
        <line ref={curveRef as any}>
            <bufferGeometry />
            <lineBasicMaterial color="#00ffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} linewidth={2} />
        </line>
    )
}

function QuantumFluctuations({ count }: { count: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 10 + Math.random() * 50
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            p[i * 3 + 2] = r * Math.cos(phi)
        }
        return p
    }, [])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial size={0.3} color="#ccffff" transparent opacity={0.5} blending={THREE.AdditiveBlending} sizeAttenuation />
        </points>
    )
}
