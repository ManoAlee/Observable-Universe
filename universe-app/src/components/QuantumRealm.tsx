import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard, Instance, Instances } from '@react-three/drei'
import * as THREE from 'three'

interface QuantumRealmProps {
    observer?: THREE.Vector2
    entropy?: number
    isDecoding?: boolean
}

export default function QuantumRealm({ observer = new THREE.Vector2(0, 0), entropy = 0.1, isDecoding = false }: QuantumRealmProps) {
    return (
        <group>
            {/* Volumetric Wave Function Core (The Schrödinger Equation) */}
            <WaveFunctionCore observer={observer} entropy={entropy} isDecoding={isDecoding} />

            {/* Superposition Field (Particles in Multiple States) */}
            <SuperpositionField count={400} chaos={entropy} />

            {/* Entanglement Web (Action at a Distance) */}
            <EntanglementSystem count={12} chaos={entropy} observer={observer} />

            {/* Ambient Quantum Fluctuations */}
            <QuantumFluctuations count={1000} />

            {/* Observer Effect UI */}
            <ObserverEye observer={observer} />
        </group>
    )
}

function WaveFunctionCore({ observer, entropy, isDecoding }: QuantumRealmProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: new THREE.Vector2(0, 0) },
            uEntropy: { value: entropy },
            uIsDecoding: { value: isDecoding ? 1.0 : 0.0 }
        },
        vertexShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          uniform float uTime;
          uniform float uEntropy;
          
          // Spherical Harmonics Approximation
          float sphericalHarmonic(vec3 p) {
              float r = length(p);
              float theta = acos(p.y / r);
              float phi = atan(p.z, p.x);
              return sin(theta * 5.0) * cos(phi * 4.0);
          }
          
          void main() {
              vPos = position;
              vec3 deformedPos = position;
              
              // Probability density deformation
              float Ylm = sphericalHarmonic(normalize(position));
              float wave = sin(uTime * 3.0 + length(position) * 0.5);
              deformedPos += normal * (Ylm * wave) * (2.0 + uEntropy * 5.0);
              
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
          uniform vec2 uObserver;
          uniform float uEntropy;
          uniform float uIsDecoding;

          void main() {
              float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.0);
              
              // Superposition Colors (Cyan/Magenta mixing)
              vec3 colorA = vec3(0.0, 1.0, 1.0);
              vec3 colorB = vec3(1.0, 0.0, 1.0);
              
              // Observer Collapse Logic
              // Calculate screen space position roughly
              vec2 screenPos = vPos.xy * 0.05; 
              float distToObs = distance(screenPos, uObserver);
              float distinctState = smoothstep(10.0, 0.0, distToObs); // 1.0 if looked at
              
              // If observed, collapse to a single color (Green/Stable)
              vec3 finalColor = mix(
                  mix(colorA, colorB, sin(uTime + vPos.x) * 0.5 + 0.5),
                  vec3(0.0, 1.0, 0.4), // Collapsed State
                  distinctState
              );

              // Probability Glow
              float glow = fresnel * (1.0 + uEntropy);
              
              gl_FragColor = vec4(finalColor * glow * 2.0, fresnel * 0.8);
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
            mat.uniforms.uTime.value = state.clock.getElapsedTime();
            mat.uniforms.uObserver.value.lerp(observer ?? new THREE.Vector2(0, 0), 0.1);
            mat.uniforms.uEntropy.value = entropy ?? 0.1;
        }
    })

    return (
        <mesh ref={meshRef}>
            <sphereGeometry args={[15, 128, 128]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

function SuperpositionField({ count, chaos }: { count: number, chaos: number }) {
    // Particles that exist in multiple places at once (visualized as rapid teleportation/flicker)
    const instancedRef = useRef<THREE.InstancedMesh>(null)
    const particleData = useMemo(() => Array.from({ length: count }).map(() => ({
        basePos: new THREE.Vector3().randomDirection().multiplyScalar(20 + Math.random() * 40),
        scale: Math.random() * 2 + 0.5,
        speed: Math.random() * 2
    })), [])

    useFrame((state) => {
        if (!instancedRef.current) return
        const t = state.clock.getElapsedTime()
        const dummy = new THREE.Object3D()

        particleData.forEach((p, i) => {
            // Quantum Tunneling Effect: Snap positions based on sine waves
            const jump = Math.sin(t * p.speed * (1 + chaos * 2) + i) > 0.9 ? 5.0 : 0.0;

            dummy.position.copy(p.basePos)
            dummy.position.x += jump * (Math.random() - 0.5)
            dummy.position.y += jump * (Math.random() - 0.5)
            dummy.position.z += jump * (Math.random() - 0.5)

            dummy.rotation.set(t, t, t)
            dummy.scale.setScalar(p.scale * (1 + jump * 0.2))

            dummy.updateMatrix()
            instancedRef.current.setMatrixAt(i, dummy.matrix)
        })
        instancedRef.current.instanceMatrix.needsUpdate = true

        // Material flickering
        const mat = instancedRef.current.material as THREE.MeshBasicMaterial
        mat.opacity = 0.3 + Math.random() * 0.3
    })

    return (
        <instancedMesh ref={instancedRef} args={[undefined, undefined, count]}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#00ffff" wireframe transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
    )
}

function EntanglementSystem({ count, chaos, observer }: { count: number, chaos: number, observer: THREE.Vector2 }) {
    return (
        <group>
            {[...Array(count)].map((_, i) => (
                <EntanglementString key={i} index={i} chaos={chaos} observer={observer} />
            ))}
        </group>
    )
}

function EntanglementString({ index, chaos, observer }: { index: number, chaos: number, observer: THREE.Vector2 }) {
    const curveRef = useRef<THREE.Line>(null)
    const points = useMemo(() => {
        const p = []
        for (let i = 0; i < 50; i++) p.push(new THREE.Vector3())
        return p
    }, [])

    useFrame((state) => {
        if (curveRef.current) {
            const t = state.clock.getElapsedTime();

            // Check observation distance (Simulated 3D projection of mouse)
            // If mouse is "looking" at this region, tension increases
            const influence = Math.max(0, 1.0 - observer.length()); // Simple center focus for now
            const tension = 1.0 + influence * 5.0;

            const start = new THREE.Vector3(
                Math.sin(t * 0.2 + index) * 30,
                Math.cos(t * 0.3 + index) * 30,
                Math.sin(t * 0.1 + index) * 30
            );
            const end = new THREE.Vector3(
                Math.sin(t * 0.4 + index * 2) * 40,
                Math.cos(t * 0.5 + index * 2) * 40,
                Math.sin(t * 0.6 + index * 2) * 40
            );

            for (let i = 0; i < 50; i++) {
                const alpha = i / 49;
                const pos = new THREE.Vector3().lerpVectors(start, end, alpha)

                // Entanglement Vibration
                // Higher tension = tighter string (less amplitude)
                const amp = (10.0 / tension) * (1 + chaos);
                const freq = 2.0 * tension;

                pos.add(new THREE.Vector3(
                    Math.sin(alpha * Math.PI * freq + t * 5.0) * amp,
                    Math.cos(alpha * Math.PI * freq + t * 3.0) * amp,
                    Math.sin(alpha * Math.PI * freq + t * 4.0) * amp
                ))

                points[i].copy(pos);
            }
            curveRef.current.geometry.setFromPoints(points);

            // Color Shift on Observation
            const mat = curveRef.current.material as THREE.LineBasicMaterial
            if (influence > 0.5) {
                mat.color.setHex(0xff0000) // Snap/Tension Color
                mat.opacity = 0.8
            } else {
                mat.color.setHex(0x00ffff) // Relaxed Quantum State
                mat.opacity = 0.3
            }
        }
    })

    return (
        <line ref={curveRef as any}>
            <bufferGeometry />
            <lineBasicMaterial color="#00ffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} linewidth={1} />
        </line>
    )
}

function ObserverEye({ observer }: { observer: THREE.Vector2 }) {
    // Visualizer for where the "Observer" is looking
    const ref = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (ref.current) {
            const x = observer.x * 30
            const y = observer.y * 30
            ref.current.position.set(x, y, 20)
            ref.current.lookAt(0, 0, 0)
        }
    })

    return (
        <group ref={ref}>
            <mesh rotation={[0, 0, 0]}>
                <ringGeometry args={[1, 1.2, 32]} />
                <meshBasicMaterial color="white" transparent opacity={0.2} side={THREE.DoubleSide} />
            </mesh>
            <mesh>
                <ringGeometry args={[1.5, 1.6, 32]} />
                <meshBasicMaterial color="white" transparent opacity={0.1} side={THREE.DoubleSide} />
            </mesh>
            <Billboard>
                <Text fontSize={0.5} position={[0, -2, 0]} color="white" font="/fonts/static/Roboto-Bold.ttf">OBSERVER</Text>
            </Billboard>
        </group>
    )
}

function QuantumFluctuations({ count }: { count: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 10 + Math.random() * 60
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
