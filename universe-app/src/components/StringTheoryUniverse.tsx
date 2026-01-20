import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'

interface StringTheoryProps {
    observer: THREE.Vector2
    speed?: number
    isDecoding?: boolean
    chaos?: number
}

export default function StringTheoryUniverse({ observer, speed = 0, isDecoding = false, chaos = 0 }: StringTheoryProps) {
    return (
        <group>
            {/* Calabi-Yau Manifolds (Compactified Dimensions) */}
            <CalabiYauField observer={observer} chaos={chaos} count={80} />

            {/* Dimensional Branes (The Bulk) */}
            <DimensionalBranes chaos={chaos} />

            {/* MULTIVERSE BUBBLES: Floating spheres representing alternate realities */}
            <MultiverseBubbles count={20} />

            {/* 11D Label */}
            <Billboard position={[0, 20, 0]}>
                <Text fontSize={2} color="#00ffff" font="/fonts/static/Roboto-Bold.ttf" fillOpacity={0.5}>
                    11TH DIMENSION // M-THEORY
                </Text>
            </Billboard>
        </group>
    )
}

function CalabiYauField({ observer, chaos, count }: { observer: THREE.Vector2, chaos: number, count: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const linesRef = useRef<THREE.InstancedMesh>(null)

    const manifolds = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 120,
                (Math.random() - 0.5) * 120,
                (Math.random() - 0.5) * 120
            ),
            rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
            scale: Math.random() * 2 + 1,
            speed: Math.random() * 0.2 + 0.1,
            phase: Math.random() * Math.PI * 2
        }))
    }, [count])

    useFrame((state) => {
        if (!meshRef.current || !linesRef.current) return
        const t = state.clock.getElapsedTime()
        const dummy = new THREE.Object3D()

        manifolds.forEach((m, i) => {
            const observerPoint = new THREE.Vector3(observer.x * 25, observer.y * 25, 0);
            const dist = m.position.distanceTo(observerPoint);

            // Interactive Attraction (Gentle)
            const attraction = Math.max(0, 40 - dist) * 0.005;
            m.position.lerp(observerPoint, attraction);

            // Calabi-Yau Rotation
            dummy.position.copy(m.position)
            dummy.rotation.set(
                m.rotation.x + t * m.speed,
                m.rotation.y + t * m.speed * 0.5,
                t * 0.1
            )

            // Vibrational Stress (Size/Scale pulse)
            const tension = 1.0 + Math.sin(t * 5.0 + m.phase) * (0.1 + chaos * 0.5);
            dummy.scale.setScalar(m.scale * tension);

            dummy.updateMatrix()
            meshRef.current!.setMatrixAt(i, dummy.matrix)
            linesRef.current!.setMatrixAt(i, dummy.matrix)
        })

        meshRef.current.instanceMatrix.needsUpdate = true
        linesRef.current.instanceMatrix.needsUpdate = true

        const mat = meshRef.current.material as THREE.ShaderMaterial
        mat.uniforms.uTime.value = t
        mat.uniforms.uObserver.value.lerp(observer, 0.1)
        mat.uniforms.uChaos.value = chaos

        const lineMat = linesRef.current.material as THREE.ShaderMaterial
        lineMat.uniforms.uTime.value = t
        lineMat.uniforms.uChaos.value = chaos
    })

    // Surface Material (Membrane)
    const manifoldMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: new THREE.Vector2() },
            uChaos: { value: 0 }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec3 vWorldPos;
            uniform float uTime;
            uniform float uChaos;

            void main() {
                vec3 p = position;
                // Vibrating membrane effect (High dimension ripple)
                float wave = sin(p.x * 5.0 + uTime * 10.0) * cos(p.y * 5.0 + uTime * 8.0);
                p += normal * wave * (0.05 + uChaos * 0.2);
                
                // 4D Rotation simulation (Warping)
                float theta = uTime * 0.5;
                float c = cos(theta);
                float s = sin(theta);
                p.xy = mat2(c, -s, s, c) * p.xy;

                vNormal = normalize(normalMatrix * normal);
                vec4 worldPos = modelMatrix * instanceMatrix * vec4(p, 1.0);
                vWorldPos = worldPos.xyz;
                vViewDir = normalize(cameraPosition - vWorldPos);
                
                gl_Position = projectionMatrix * viewMatrix * worldPos;
            }
        `,
        fragmentShader: `
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec3 vWorldPos;
            uniform float uTime;
            uniform float uChaos;

            void main() {
                // Iridescent Fresnel
                float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
                
                // Color Palette: Vibrating Strings (Gold/Blue/Purple)
                vec3 colA = vec3(0.1, 0.0, 0.3); // Deep Void
                vec3 colB = vec3(0.0, 0.5, 1.0); // Electric Blue
                vec3 colC = vec3(1.0, 0.8, 0.2); // Energy Gold

                vec3 baseColor = mix(colA, colB, fresnel);
                
                // Interference pattern
                float interference = sin(vWorldPos.y * 2.0 + uTime * 5.0);
                baseColor += colC * step(0.9, interference) * fresnel;

                // Chaos injection
                if (uChaos > 0.5) {
                    baseColor = mix(baseColor, vec3(1.0, 0.0, 0.0), (uChaos - 0.5) * sin(uTime * 20.0));
                }

                gl_FragColor = vec4(baseColor, 0.4 + fresnel * 0.6);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }), [])

    // Wireframe Material (String Harmonics)
    const lineMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uChaos: { value: 0 }
        },
        vertexShader: `
            varying float vGlow;
            uniform float uTime;
            void main() {
                vec3 p = position;
                // Intense high-frequency vibration
                p += normal * sin(uTime * 50.0 + position.z * 10.0) * 0.02;
                
                vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(p, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // Depth-based glow
                vGlow = 100.0 / -mvPosition.z;
            }
        `,
        fragmentShader: `
            varying float vGlow;
            uniform float uChaos;
            uniform float uTime;
            void main() {
                float pulse = 0.5 + 0.5 * sin(uTime * 10.0);
                vec3 color = vec3(0.4, 0.8, 1.0);
                if (uChaos > 0.0) color = mix(color, vec3(1.0, 1.0, 0.0), uChaos);
                
                gl_FragColor = vec4(color, vGlow * pulse * 0.5);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        wireframe: true
    }), [])

    return (
        <group>
            {/* Membranes */}
            <instancedMesh ref={meshRef} args={[new THREE.TorusKnotGeometry(2, 0.6, 128, 32), manifoldMaterial, count]} />

            {/* String Harmonics (Wireframe overlay) */}
            <instancedMesh ref={linesRef} args={[new THREE.TorusKnotGeometry(2, 0.65, 64, 16), lineMaterial, count]} />
        </group>
    )
}

function DimensionalBranes({ chaos }: { chaos: number }) {
    // Large, floating planes representing D-Branes (Membranes in the Bulk)
    const count = 5
    const mesh = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    useFrame((state) => {
        if (!mesh.current) return
        const t = state.clock.elapsedTime

        for (let i = 0; i < count; i++) {
            dummy.position.set(0, (i - count / 2) * 10, 0)
            dummy.rotation.x = Math.PI / 2 + Math.sin(t * 0.1 + i) * 0.1
            dummy.rotation.z = Math.cos(t * 0.05 + i) * 0.05

            // Interaction with chaos: Branes ripple violently
            const warp = Math.sin(t * 2.0) * chaos
            dummy.scale.set(50, 50, 1 + warp)

            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)
        }
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[new THREE.PlaneGeometry(1, 1, 32, 32), undefined, count]}>
            <meshPhysicalMaterial
                color="#220033"
                transparent
                opacity={0.1}
                side={THREE.DoubleSide}
                metalness={0.8}
                roughness={0.2}
                clearcoat={1.0}
            />
        </instancedMesh>
    )
}

function MultiverseBubbles({ count = 20 }) {
    const mesh = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])
    const particles = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150),
            scale: Math.random() * 5 + 2,
            speed: Math.random() * 0.05
        }))
    }, [count])

    useFrame((state) => {
        if (!mesh.current) return
        particles.forEach((p, i) => {
            p.position.y += Math.sin(state.clock.elapsedTime * p.speed + i) * 0.1
            dummy.position.copy(p.position)
            dummy.scale.setScalar(p.scale)
            dummy.updateMatrix()
            mesh.current!.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[new THREE.SphereGeometry(1, 32, 32), undefined, count]}>
            <meshPhysicalMaterial
                transmission={0.9}
                roughness={0}
                thickness={2}
                ior={1.5}
                color="#aaccff"
                emissive="#4400ff"
                emissiveIntensity={0.2}
            />
        </instancedMesh>
    )
}
