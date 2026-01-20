import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Billboard } from '@react-three/drei'
import * as THREE from 'three'
import DataStream from './DataStream'


interface SingularityProps {
    isDecoding?: boolean
}

export default function InformationSingularity({ isDecoding = false }: SingularityProps) {
    const meshRef = useRef<THREE.Mesh>(null)

    // Event Horizon Shader (Black Hole consuming data)
    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uColorA: { value: new THREE.Color("#000000") },
            uColorB: { value: new THREE.Color("#ffaa00") }, // Accretion glow
        },
        vertexShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          void main() {
              vPos = position;
              vNormal = normalize(normalMatrix * normal);
              vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
              vViewDir = normalize(-mvPos.xyz);
              gl_Position = projectionMatrix * mvPos;
          }
      `,
        fragmentShader: `
          varying vec3 vPos;
          varying vec3 vNormal;
          varying vec3 vViewDir;
          uniform float uTime;
          uniform vec3 uColorA;
          uniform vec3 uColorB;

          void main() {
              float r = length(vPos);
              vec3 viewDir = normalize(cameraPosition - vPos);
              
              // Gravitational Lensing approximation
              float rim = 1.0 - max(dot(viewDir, vNormal), 0.0);
              float glow = pow(rim, 4.0);
              
              // Event Horizon warping
              float warp = sin(atan(vPos.y, vPos.x) * 10.0 + uTime * 2.0 - length(vPos) * 0.1);
              vec3 horizon = mix(uColorA, uColorB, glow + warp * 0.1);

              gl_FragColor = vec4(horizon, 1.0);
          }
      `,
        transparent: true,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending
    }), [])

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime()
            meshRef.current.rotation.y += 0.0005
        }
    })

    return (
        <group>
            {/* The Singularity (Black Hole) */}
            <mesh ref={meshRef} scale={[0.5, 0.5, 0.5]}>
                <sphereGeometry args={[40, 64, 64]} />
                <primitive object={material} attach="material" />
            </mesh>

            {/* Accretion Disk (Spinning Data) */}
            <DataAccretionDisk />

            {/* Relativistic Data Jets */}
            <DataStream />


            {/* The Source (Central white point) */}
            <mesh>
                <sphereGeometry args={[5, 32, 32]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
                <pointLight intensity={10} distance={100} color="#ffffff" />
            </mesh>


            <Billboard position={[0, 60, 0]}>
                <Text fontSize={4} color="#ffffff" font="/fonts/static/Roboto-Bold.ttf" outlineWidth={0.1} outlineColor="#000000">
                    EVENT HORIZON // DATA ZERO
                </Text>
            </Billboard>
        </group>
    )
}

function DataAccretionDisk() {
    // A swirling disk of binary data entering the hole
    const count = 1000
    const mesh = useRef<THREE.InstancedMesh>(null)
    const dummy = useMemo(() => new THREE.Object3D(), [])

    const particles = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            angle: Math.random() * Math.PI * 2,
            radius: 50 + Math.random() * 150,
            speed: 0.2 + Math.random() * 0.5,
            yOffset: (Math.random() - 0.5) * 10,
            scale: Math.random() * 2 + 0.5
        }))
    }, [])

    useFrame((state) => {
        if (!mesh.current) return
        const t = state.clock.getElapsedTime()

        particles.forEach((p, i) => {
            // Spiral mechanics: r decreases, speed increases
            // Simulated simplified orbital mechanics
            const currentSpeed = p.speed * (200 / p.radius); // Faster near center
            const currentAngle = p.angle + t * currentSpeed * 0.1;

            const x = Math.cos(currentAngle) * p.radius
            const z = Math.sin(currentAngle) * p.radius

            dummy.position.set(x, p.yOffset * (p.radius / 200), z)

            // Look at center
            dummy.lookAt(0, 0, 0)
            dummy.scale.setScalar(p.scale)

            dummy.updateMatrix()
            mesh.current!.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 0.2, 2]} />
            <meshBasicMaterial color="#00ff88" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    )
}
