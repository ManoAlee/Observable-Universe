import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StringTheoryProps {
    observer: THREE.Vector2
    speed?: number
    isDecoding?: boolean
    chaos?: number
}

export default function StringTheoryUniverse({ observer, speed = 0, isDecoding = false, chaos = 0 }: StringTheoryProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null)
    const linesRef = useRef<THREE.InstancedMesh>(null)
    const count = 60

    const manifolds = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            ),
            rotation: new THREE.Euler(Math.random() * Math.PI, Math.random() * Math.PI, 0),
            scale: Math.random() * 2 + 1,
            speed: Math.random() * 0.15 + 0.05
        }))
    }, [])

    useFrame((state) => {
        if (!meshRef.current || !linesRef.current) return
        const t = state.clock.getElapsedTime()
        const dummy = new THREE.Object3D()

        manifolds.forEach((m, i) => {
            const observerPoint = new THREE.Vector3(observer.x * 25, observer.y * 25, 0);
            const dist = m.position.distanceTo(observerPoint);
            const attraction = Math.max(0, 30 - dist) * 0.04;

            dummy.position.copy(m.position).lerp(observerPoint, attraction);
            dummy.rotation.set(m.rotation.x + t * m.speed, m.rotation.y + t * m.speed * 0.5, t * 0.2)

            const tension = 1.0 + (15.0 / (dist + 5.0));
            dummy.scale.setScalar(m.scale * (1 + Math.sin(t * 2.0 + i) * 0.05) * tension);

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

    const manifoldMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: observer },
            uChaos: { value: chaos }
        },
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewDir;
            varying vec3 vWorldPos;
            uniform float uTime;
            uniform float uChaos;

            void main() {
                // Calabi-Yau approximation math
                vec3 p = position;
                float t = uTime * 0.8;
                
                // 6D toroidal projection
                float v1 = sin(p.x * 0.5 + t) * cos(p.y * 0.5 + t);
                float v2 = sin(p.y * 0.5 - t) * cos(p.z * 0.5 + t);
                p += normal * (v1 + v2) * (0.5 + uChaos * 2.0);
                
                // Harmonic resonance jitter
                p += sin(p * 20.0 + uTime * 15.0) * 0.05 * uChaos;

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
                // Fresnel effect for iridescence
                float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 3.0);
                
                vec3 colorA = vec3(0.0, 0.5, 1.0); // Electric Blue
                vec3 colorB = vec3(1.0, 0.0, 0.5); // Neon Pink
                vec3 colorC = vec3(0.2, 1.0, 0.4); // Matrix Green
                
                vec3 baseColor = mix(colorA, colorB, sin(uTime + vWorldPos.x * 0.1) * 0.5 + 0.5);
                if (uChaos > 0.5) baseColor = mix(baseColor, colorC, (uChaos - 0.5) * 2.0);
                
                // Edge glow
                float edge = step(0.9, fresnel);
                vec3 finalColor = mix(baseColor, vec3(1.0), fresnel * 0.5 + edge * 0.5);
                
                // Dissonance flashes
                float flash = step(0.99, sin(uTime * 30.0 + vWorldPos.y));
                finalColor += flash * uChaos;

                gl_FragColor = vec4(finalColor, 0.6 + fresnel * 0.4);
            }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    }), [])

    const lineMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uChaos: { value: chaos }
        },
        vertexShader: `
            varying float vAlpha;
            uniform float uTime;
            void main() {
                vec3 p = position;
                p *= 1.1 + sin(uTime * 5.0 + position.y) * 0.1;
                vAlpha = 0.2 + 0.2 * sin(uTime * 10.0 + position.x);
                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.0);
            }
        `,
        fragmentShader: `
            varying float vAlpha;
            uniform float uChaos;
            void main() {
                vec3 color = mix(vec3(1.0), vec3(1.0, 0.2, 0.0), uChaos);
                gl_FragColor = vec4(color, vAlpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])

    return (
        <group>
            <instancedMesh ref={meshRef} args={[new THREE.TorusKnotGeometry(2, 0.5, 128, 32), manifoldMaterial, count]} />
            <instancedMesh ref={linesRef} args={[new THREE.TorusKnotGeometry(2, 0.52, 64, 16), lineMaterial, count]} />
        </group>
    )
}
