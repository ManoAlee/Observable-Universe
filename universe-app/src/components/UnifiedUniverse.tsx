import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Float, Points, PointMaterial, Billboard, Text } from '@react-three/drei'
import * as THREE from 'three'
import { fibonacciSphere } from '../math/MathKernel'
import InteractionField from './InteractionField'

interface UnifiedUniverseProps {
    observer: THREE.Vector2
    entropy: number
    depth: number
    isDecoding?: boolean
    speed?: number
}

type CosmicEvent = 'NONE' | 'SUPERNOVA' | 'VOID_COLLAPSE'

export default function UnifiedUniverse({ observer, entropy, depth, isDecoding = false, speed = 0 }: UnifiedUniverseProps) {
    const mainRef = useRef<THREE.Group>(null)
    const [gravityActive, setGravityActive] = useState(false)
    const [cosmicEvent, setCosmicEvent] = useState<CosmicEvent>('NONE')

    // Handle Interaction (Gravity Hand)
    useEffect(() => {
        const handleDown = () => setGravityActive(true)
        const handleUp = () => setGravityActive(false)
        window.addEventListener('mousedown', handleDown)
        window.addEventListener('mouseup', handleUp)
        return () => {
            window.removeEventListener('mousedown', handleDown)
            window.removeEventListener('mouseup', handleUp)
        }
    }, [])

    // Trigger Random Cosmic Events
    useEffect(() => {
        const triggerEvent = () => {
            const r = Math.random()
            if (r > 0.7) {
                setCosmicEvent(r > 0.85 ? 'SUPERNOVA' : 'VOID_COLLAPSE')
                setTimeout(() => setCosmicEvent('NONE'), 3000) // Reset after 3s
            }
        }
        const interval = setInterval(triggerEvent, 10000) // Check every 10s
        return () => clearInterval(interval)
    }, [])

    useFrame((state) => {
        if (mainRef.current) {
            mainRef.current.rotation.y = state.clock.getElapsedTime() * 0.05
        }
    })

    return (
        <group ref={mainRef}>
            {/* The Core Singularity (Living Particle System) */}
            <Singularity
                observer={observer}
                entropy={entropy}
                gravity={gravityActive}
                evt={cosmicEvent}
            />

            {/* Quantum Harmonic Orbital (Simplified Volumetric) */}
            <QuantumOrbital observer={observer} entropy={entropy} isDecoding={isDecoding} />

            {/* Manifold Strings (String Theory Layer) */}
            <UnifiedStrings observer={observer} />

            {/* Binary Data Strands (Binary Layer) */}
            <BinaryStrands observer={observer} depth={depth} />

            {/* Volumetric Haze (Holographic Atmosphere) */}
            <AtmosHaze observer={observer} />

            {/* 3D Holographic Labels (Part of HUD v7.0) */}
            <HolographicMarkers observer={observer} />

            {/* NEW: Observer Interaction Field */}
            <InteractionField observer={observer} />

            {/* Dimensional Manifolds (High-D Folds) */}
            <DimensionalManifolds entropy={entropy} />


            {/* Event Notification */}
            <Float speed={5} rotationIntensity={0} floatIntensity={0}>
                <Text position={[0, -20, 0]} fontSize={2} color={cosmicEvent === 'SUPERNOVA' ? "#ffaa00" : (cosmicEvent === 'VOID_COLLAPSE' ? "#aa00ff" : "#00000000")} font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="center">
                    {cosmicEvent === 'SUPERNOVA' ? "WARNING // SUPERNOVA DETECTED" : (cosmicEvent === 'VOID_COLLAPSE' ? "WARNING // VOID COLLAPSE IMMINENT" : "")}
                </Text>
            </Float>
        </group>
    )
}


function Singularity({ observer, entropy, gravity, evt }: { observer: THREE.Vector2; entropy: number; gravity: boolean; evt: CosmicEvent }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const pointsRef = useRef<THREE.Points>(null)

    // GEOMETRY OF TRUTH: Fibonacci Sphere
    const particles = useMemo(() => {
        return fibonacciSphere(5000, 20) // Increased density
    }, [])

    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: observer },
            uEntropy: { value: entropy },
            uGravity: { value: 0 },
            uExplosion: { value: 0 }, // Supernova factor
            uImplosion: { value: 0 }  // Void Collapse factor
        },
        vertexShader: `
            varying vec3 vPos;
            varying float vDist;
            uniform float uTime;
            uniform vec2 uObserver;
            uniform float uEntropy;
            uniform float uGravity;
            uniform float uExplosion;
            uniform float uImplosion;
            
            // Simplex Noise
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
            vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
            float snoise(vec3 v) {
                const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
                const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
                vec3 i  = floor(v + dot(v, C.yyy) );
                vec3 x0 = v - i + dot(i, C.xxx) ;
                vec3 g = step(x0.yzx, x0.xyz);
                vec3 l = 1.0 - g;
                vec3 i1 = min( g.xyz, l.zxy );
                vec3 i2 = max( g.xyz, l.zxy );
                vec3 x1 = x0 - i1 + C.xxx;
                vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
                vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y
                i = mod289(i);
                vec4 p = permute( permute( permute( 
                            i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                          + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                          + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
                float n_ = 0.142857142857; // 1.0/7.0
                vec3  ns = n_ * D.wyz - D.xzx;
                vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)
                vec4 x_ = floor(j * ns.z);
                vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)
                vec4 x = x_ *ns.x + ns.yyyy;
                vec4 y = y_ *ns.x + ns.yyyy;
                vec4 h = 1.0 - abs(x) - abs(y);
                vec4 b0 = vec4( x.xy, y.xy );
                vec4 b1 = vec4( x.zw, y.zw );
                vec4 s0 = floor(b0)*2.0 + 1.0;
                vec4 s1 = floor(b1)*2.0 + 1.0;
                vec4 sh = -step(h, vec4(0.0));
                vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
                vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
                vec3 p0 = vec3(a0.xy,h.x);
                vec3 p1 = vec3(a0.zw,h.y);
                vec3 p2 = vec3(a1.xy,h.z);
                vec3 p3 = vec3(a1.zw,h.w);
                vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
                p0 *= norm.x;
                p1 *= norm.y;
                p2 *= norm.z;
                p3 *= norm.w;
                vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                m = m * m;
                return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                            dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                vPos = position;
                
                // Base Chaos Loop
                vec3 pos = position + vec3(
                    snoise(position * 0.1 + uTime * 0.2),
                    snoise(position * 0.1 + uTime * 0.3 + 10.0),
                    snoise(position * 0.1 + uTime * 0.4 + 20.0)
                ) * (2.0 + uEntropy * 5.0);

                // GRAVITY HAND: Pull towards center
                if (uGravity > 0.0) {
                    pos = mix(pos, vec3(0.0), uGravity * 0.8);
                }

                // COSMIC EVENTS
                if (uExplosion > 0.0) {
                    // Supernova: Expands outward violently
                    vec3 dir = normalize(pos);
                    pos += dir * uExplosion * 50.0 * snoise(pos + uTime);
                }
                if (uImplosion > 0.0) {
                    // Void Collapse: Shrinks to nothingness
                    pos = mix(pos, vec3(0.0), uImplosion);
                }

                vDist = length(pos); // Save distance for size/color

                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_Position = projectionMatrix * mvPosition;
                
                // SIZE ATTENUATION + Event Scaling
                float size = (300.0 / -mvPosition.z);
                if (uExplosion > 0.0) size *= (1.0 + uExplosion * 5.0); // Flare up
                gl_PointSize = size;
            }
        `,
        fragmentShader: `
            varying vec3 vPos;
            varying float vDist;
            uniform float uTime;
            uniform float uGravity;
            uniform float uExplosion;
            uniform float uImplosion;

            void main() {
                // Circle particle
                vec2 coord = gl_PointCoord - vec2(0.5);
                float dist = length(coord);
                if (dist > 0.5) discard;

                // Color Palette
                vec3 coreColor = vec3(1.0, 0.8, 0.4); // Gold Core
                vec3 outerColor = vec3(0.0, 0.5, 1.0); // Blue Halo
                vec3 gravityColor = vec3(0.5, 0.0, 1.0); // Purple Gravity
                vec3 novaColor = vec3(1.0, 0.2, 0.1); // Red Nova

                // Mix based on physics
                vec3 color = mix(coreColor, outerColor, smoothstep(0.0, 30.0, vDist));
                
                if (uGravity > 0.0) {
                    color = mix(color, gravityColor, uGravity);
                }
                if (uExplosion > 0.0) {
                    color = mix(color, novaColor, uExplosion);
                }
                if (uImplosion > 0.0) {
                    color = vec3(0.0); // Black hole
                }

                // Optical flare intensity (center is bright)
                float alpha = (1.0 - dist * 2.0);
                alpha = pow(alpha, 2.0); // Sharper falloff

                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    }), [])

    useFrame((state, delta) => {
        if (pointsRef.current) {
            const mat = pointsRef.current.material as THREE.ShaderMaterial

            // Uniform Smoothing
            mat.uniforms.uTime.value = state.clock.getElapsedTime()
            mat.uniforms.uObserver.value.lerp(observer, 0.1)
            mat.uniforms.uEntropy.value = THREE.MathUtils.lerp(mat.uniforms.uEntropy.value, entropy, 0.1)

            // Interaction Physics
            const targetGravity = gravity ? 1.0 : 0.0
            mat.uniforms.uGravity.value = THREE.MathUtils.lerp(mat.uniforms.uGravity.value, targetGravity, 0.1)

            // Event Physics
            const targetExplosion = evt === 'SUPERNOVA' ? 1.0 : 0.0
            mat.uniforms.uExplosion.value = THREE.MathUtils.lerp(mat.uniforms.uExplosion.value, targetExplosion, 0.05)

            const targetImplosion = evt === 'VOID_COLLAPSE' ? 1.0 : 0.0
            mat.uniforms.uImplosion.value = THREE.MathUtils.lerp(mat.uniforms.uImplosion.value, targetImplosion, 0.05)

            // Rotation
            pointsRef.current.rotation.y += 0.005 + (mat.uniforms.uGravity.value * 0.05) // Spin faster when gravity is high
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={particles.length / 3}
                    array={particles}
                    itemSize={3}
                />
            </bufferGeometry>
            <primitive object={material} attach="material" />
        </points>
    )
}

function QuantumOrbital({ observer, entropy, isDecoding }: { observer: THREE.Vector2; entropy: number; isDecoding: boolean }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const material = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uObserver: { value: observer },
            uEntropy: { value: entropy },
            uIsDecoding: { value: isDecoding ? 1.0 : 0.0 }
        },
        vertexShader: `
            varying vec3 vPos;
void main() {
    vPos = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,
        fragmentShader: `
            varying vec3 vPos;
            uniform float uTime;
            uniform vec2 uObserver;
            uniform float uEntropy;
            uniform float uIsDecoding;

void main() {
                float r = length(vPos);
                float theta = acos(vPos.z / (r + 0.1));
                float phi = atan(vPos.y, vPos.x);

                // Unified Wave Function: Bipolar Orbital
                float wave = sin(2.0 * theta) * cos(phi + uTime);
                float radial = exp(-r / 3.0) * pow(r, 2.0);
                
                float prob = abs(wave * radial);

                // Color shift based on entropy
                vec3 color = mix(vec3(0.0, 0.8, 1.0), vec3(1.0, 1.0, 1.0), uEntropy);

    // Kinetic Decompilation logic (Simpler for orbitals)
    if (uIsDecoding > 0.5) {
                    float noise = fract(sin(vPos.y * 100.0 + uTime) * 43758.5453);
        if (noise > 0.95) {
            gl_FragColor = vec4(0.0, 1.0, 0.5, 0.8);
            return;
        }
    }

    gl_FragColor = vec4(color, prob * 0.1);
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
            mat.uniforms.uObserver.value.lerp(observer, 0.1);

            // Mouse velocity as a "Physical Pressure"
            const scale = 3 + Math.abs(observer.x + observer.y) * 2;
            meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.05);
        }
    })

    return (
        <mesh ref={meshRef} scale={8}>
            <sphereGeometry args={[10, 64, 64]} />
            <primitive object={material} attach="material" />
        </mesh>
    )
}

function UnifiedStrings({ observer }: { observer: THREE.Vector2 }) {
    const count = 40
    const instancedRef = useRef<THREE.InstancedMesh>(null)

    const strings = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            radius: 20 + Math.random() * 30,
            angle: (i / count) * Math.PI * 2,
            speed: 0.2 + Math.random() * 0.5,
            offset: Math.random() * 10
        }))
    }, [])

    useFrame((state) => {
        if (!instancedRef.current) return
        const t = state.clock.getElapsedTime()
        const dummy = new THREE.Object3D()

        strings.forEach((s, i) => {
            const angle = s.angle + t * s.speed
            const x = Math.cos(angle) * s.radius
            const z = Math.sin(angle) * s.radius
            const y = Math.sin(t + s.offset) * 8

            dummy.position.set(x, y, z)
            dummy.scale.setScalar(1.0 + Math.sin(t * 2 + i) * 0.5)
            dummy.rotation.set(t, t * 0.5, angle)
            dummy.updateMatrix()
            instancedRef.current!.setMatrixAt(i, dummy.matrix)
        })
        instancedRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={instancedRef} args={[new THREE.TorusGeometry(1.5, 0.2, 16, 100), new THREE.MeshBasicMaterial({ color: '#00ffff', transparent: true, opacity: 0.8 }), count]} />
    )
}

function BinaryStrands({ observer, depth }: { observer: THREE.Vector2; depth: number }) {
    const pointsRef = useRef<THREE.Points>(null)
    const count = 2000

    const positions = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 40 + Math.random() * 60
            const theta = Math.random() * Math.PI * 2
            p[i * 3] = Math.cos(theta) * r
            p[i * 3 + 1] = (Math.random() - 0.5) * 50
            p[i * 3 + 2] = Math.sin(theta) * r
        }
        return p
    }, [])

    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y += 0.002
        }
    })

    return (
        <Points ref={pointsRef} positions={positions} stride={3}>
            <PointMaterial
                transparent
                color="#00ff44"
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.3}
            />
        </Points>
    )
}

function AtmosHaze({ observer }: { observer: THREE.Vector2 }) {
    return (
        <mesh scale={200}>
            <sphereGeometry args={[1, 32, 32]} />
            <meshBasicMaterial side={THREE.BackSide} color="#050010" transparent opacity={0.6} />
        </mesh>
    )
}

function HolographicMarkers({ observer }: { observer: THREE.Vector2 }) {
    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Billboard position={[0, 12, 0]}>
                    <mesh rotation={[Math.PI / 4, 0, Math.PI / 4]}>
                        <octahedronGeometry args={[1.5]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.6} wireframe />
                    </mesh>
                    {/* Visual Line */}
                    <mesh position={[0, -3, 0]}>
                        <boxGeometry args={[20, 0.05, 0.05]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.2} />
                    </mesh>
                </Billboard>
            </Float>

            <Billboard position={[35, 0, -20]}>
                <mesh rotation={[0, Math.PI / 4, 0]}>
                    <icosahedronGeometry args={[1.2]} />
                    <meshBasicMaterial color="#00ff44" transparent opacity={0.4} wireframe />
                </mesh>
                <Text position={[0, -2, 0]} fontSize={0.6} color="#00ff44" fillOpacity={0.5} font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    BIT_DENSITY: LANDAUER_LIMIT_SYNC
                </Text>
            </Billboard>

            <Billboard position={[-35, 15, -10]}>
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[1, 0.1, 16, 32]} />
                    <meshBasicMaterial color="#ff00ff" transparent opacity={0.4} />
                </mesh>
                <Text position={[0, -2, 0]} fontSize={0.6} color="#ff00ff" fillOpacity={0.5} font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    STRING_TENSION: M_THEORY_STABLE
                </Text>
            </Billboard>
        </group>
    )
}
function DimensionalManifolds({ entropy }: { entropy: number }) {
    const ref = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime
            ref.current.rotation.x = t * 0.1
            ref.current.rotation.y = t * 0.15
            ref.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.1)
        }
    })

    return (
        <group ref={ref}>
            <Float speed={3} rotationIntensity={2} floatIntensity={2}>
                <mesh position={[25, 15, -10]}>
                    <torusKnotGeometry args={[4, 1.2, 128, 32]} />
                    <meshPhysicalMaterial
                        color="#00ffff"
                        emissive="#00ffff"
                        emissiveIntensity={0.5 + entropy}
                        metalness={1}
                        roughness={0}
                        transmission={0.5}
                        thickness={2}
                    />
                </mesh>
                <mesh position={[-30, -10, 5]}>
                    <octahedronGeometry args={[5]} />
                    <meshPhysicalMaterial
                        color="#ff00ff"
                        emissive="#ff00ff"
                        emissiveIntensity={1}
                        wireframe
                    />
                </mesh>
            </Float>
        </group>
    )
}
