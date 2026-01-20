import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Float, Billboard, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export default function TheGreatSilence({ entropy = 0 }: { entropy?: number }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const staticRef = useRef<THREE.Points>(null);
    const monolithsRef = useRef<THREE.Group>(null);

    // Monolith Data
    const monoliths = useMemo(() => {
        return new Array(20).fill(0).map((_, i) => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 150,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 150
            ),
            rotation: [Math.random() * Math.PI, Math.random() * Math.PI, 0] as [number, number, number],
            scale: 2 + Math.random() * 8,
            id: i
        }))
    }, []);


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
        if (monolithsRef.current) {
            monolithsRef.current.rotation.y = t * 0.02;
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
                <sphereGeometry args={[8, 32, 32]} />
                <meshBasicMaterial color="#00ffff" transparent opacity={0.4} blending={THREE.AdditiveBlending} />
                <pointLight intensity={20} distance={150} color="#00ffff" />
            </mesh>

            {/* Monoliths of Dead Civilizations */}
            <group ref={monolithsRef}>
                {monoliths.map((m) => (
                    <Monolith key={m.id} {...m} />
                ))}
            </group>

            {/* Fading Signals */}
            <FadingSignals count={50} />

            {/* Haunted Broadcasts (Last Gasps) */}
            <HauntedBroadcasts count={5} />



            {/* Floating Labels */}
            <Float speed={2} rotationIntensity={0.2} floatIntensity={1}>
                <Billboard position={[0, 60, 0]}>
                    <Text
                        fontSize={8}
                        color="#ffffff"
                        font="/fonts/static/Roboto-Bold.ttf"
                        maxWidth={200}
                        textAlign="center"
                        letterSpacing={0.5}
                    >
                        EMPTY_STRETCH
                    </Text>
                    <Text
                        position={[0, -6, 0]}
                        fontSize={2.5}
                        color="#ff0044"
                        fillOpacity={0.8}
                        font="/fonts/static/Roboto-Bold.ttf"
                    >
                        WHERE IS EVERYBODY?
                    </Text>
                </Billboard>
            </Float>



            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 0]} intensity={2} color="#00ffff" />
        </group>
    );
}
function Monolith({ position, rotation, scale }: { position: THREE.Vector3, rotation: [number, number, number], scale: number }) {
    return (
        <group position={position} rotation={rotation}>
            <mesh scale={[0.5 * scale, 2 * scale, 0.2 * scale]}>
                <boxGeometry />
                <meshPhysicalMaterial
                    color="#050505"
                    metalness={1}
                    roughness={0.05}
                    reflectivity={1}
                    emissive="#00ffff"
                    emissiveIntensity={0.05}
                />
            </mesh>
            {/* Faint blue line across the monolith */}
            <mesh position={[0, 0, 0.11 * scale]} scale={[0.4 * scale, 0.02 * scale, 0.01 * scale]}>
                <boxGeometry />
                <meshBasicMaterial color="#00ffff" />
            </mesh>
        </group>
    )
}

function FadingSignals({ count }: { count: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const signals = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            ),
            speed: 0.1 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2
        }))
    }, [count]);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (!meshRef.current) return;

        signals.forEach((s, i) => {
            const opacity = Math.max(0, Math.sin(t * s.speed + s.phase));
            dummy.position.copy(s.position);
            dummy.scale.setScalar(opacity * 0.5);
            dummy.updateMatrix();
            meshRef.current?.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial color="#00ffff" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    )
}

function HauntedBroadcasts({ count }: { count: number }) {
    const broadcasts = useMemo(() => {
        const texts = [
            "ARE YOU THERE?",
            "WE WERE HERE",
            "THE VOID IS GROWING",
            "SIGNAL_LOST",
            "NO_RESPONSE_FOUND",
            "THEY_ARE_COMING"
        ]
        return new Array(count).fill(0).map((_, i) => ({
            text: texts[Math.floor(Math.random() * texts.length)],
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100,
                (Math.random() - 0.5) * 100
            ),
            id: i
        }))
    }, [count])

    return (
        <group>
            {broadcasts.map(b => (
                <FlickerText key={b.id} text={b.text} position={b.position} />
            ))}
        </group>
    )
}

function FlickerText({ text, position }: { text: string, position: THREE.Vector3 }) {
    const ref = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime
            const visible = Math.random() > 0.95 + Math.sin(t) * 0.04
            ref.current.visible = visible
        }
    })

    return (
        <Billboard ref={ref} position={position}>
            <Text
                fontSize={1.5}
                color="#00ffff"
                font="/fonts/static/Roboto-Bold.ttf"
                fillOpacity={0.2}
            >
                {text}
            </Text>
        </Billboard>
    )
}

