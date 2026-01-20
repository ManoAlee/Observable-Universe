import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree, extend } from '@react-three/fiber'
import { Text, Float, Stars, MeshTransmissionMaterial, shaderMaterial, Trail, Sparkles, Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { EffectComposer, Bloom, Noise, ChromaticAberration } from '@react-three/postprocessing'

// --- CUSTOM SHADERS ---

// 1. Organic Membrane Shader (Throbbing, Living)
const OrganicMaterial = shaderMaterial(
    { uTime: 0, uColor: new THREE.Color('#ffaa00'), uMouse: new THREE.Vector3(0, 0, 0) },
    // Vertex Shader
    `
    uniform float uTime;
    uniform vec3 uMouse;
    varying vec3 vNormal;
    varying vec2 vUv;
    varying float vDisplacement;

    // Simplex Noise (simplified)
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
    float snoise(vec3 v) { 
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;
        i = mod289(i); 
        vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
        float n_ = 0.142857142857;
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );
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
      vNormal = normal;
      vUv = uv;
      
      // Throbbing noise
      float noiseVal = snoise(position * 2.0 + uTime * 0.5);
      vDisplacement = noiseVal;
      
      // Mouse interaction (bulge)
      float dist = distance(position + modelMatrix[3].xyz, uMouse);
      float influence = smoothstep(5.0, 0.0, dist);
      
      vec3 newPos = position + normal * (noiseVal * 0.2 + influence * 0.5);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(newPos, 1.0);
    }
  `,
    // Fragment Shader
    `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec3 vNormal;
    varying float vDisplacement;

    void main() {
      // Subsurface scattering fake
      float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      
      // Pulse color
      vec3 color = uColor;
      color += vec3(0.8, 0.2, 0.1) * vDisplacement; // Red veins
      color += fresnel * vec3(1.0, 0.5, 0.2); // Rim light
      
      gl_FragColor = vec4(color, 1.0);
    }
  `
)

// 2. Hologram Tech Shader
const HologramMaterial = shaderMaterial(
    { uTime: 0, uColor: new THREE.Color('#00ffff') },
    // Vertex
    `
      varying vec3 vPos;
      varying vec3 vNormal;
      void main() {
        vPos = position;
        vNormal = normal;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    // Fragment
    `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec3 vPos;
      varying vec3 vNormal;
  
      void main() {
        // Horizontal scanlines
        float scanline = sin(vPos.y * 20.0 - uTime * 5.0) * 0.5 + 0.5;
        
        // Rim lighting
        vec3 viewDir = vec3(0.0, 0.0, 1.0);
        float rim = 1.0 - dot(vNormal, viewDir);
        rim = pow(rim, 3.0);
        
        float alpha = rim + scanline * 0.2;
        gl_FragColor = vec4(uColor, alpha * 0.8);
      }
    `
)

extend({ OrganicMaterial, HologramMaterial })

interface DualMindProps {
    entropy?: number
    coherence?: number
}

export default function DualMindUniverse({ entropy = 0.5, coherence = 0.5 }: DualMindProps) {
    const { mouse, camera } = useThree()
    const [mouseVec, setMouseVec] = useState(new THREE.Vector3())

    useFrame(() => {
        // Convert mouse (NDC) to rough world coords at z=0
        mouseVec.set(mouse.x * 20, mouse.y * 10, 0)
    })

    return (
        <group>
            <ambientLight intensity={0.1} />
            <pointLight position={[0, 0, 10]} intensity={0.5} />

            {/* BACKGROUND ATMOSPHERE */}
            <color attach="background" args={['#050510']} />
            <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />

            {/* LEFT: ORGANIC MIND */}
            <group position={[-12, 0, 0]}>
                <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
                    <Text position={[0, 12, 0]} fontSize={1.2} color="#ffaa00" font="/fonts/Roboto-VariableFont_wdth,wght.ttf" letterSpacing={0.1}>
                        BIOLOGICAL // CHAOS
                    </Text>
                    <OrganicCluster count={150} mouseVec={mouseVec} />
                </Float>
            </group>

            {/* RIGHT: SYNTHETIC MIND */}
            <group position={[12, 0, 0]}>
                <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
                    <Text position={[0, 12, 0]} fontSize={1.2} color="#00ffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf" letterSpacing={0.1}>
                        SYNTHETIC // ORDER
                    </Text>
                    <SyntheticCluster count={150} />
                </Float>
            </group>

            {/* CENTER: SINGULARITY BRIDGE */}
            <SynapticBridge />

            {/* INTERACTIVE DATA STREAMS */}
            <DataStreams mouseVec={mouseVec} />

            {/* POST PROCESSING */}
            {/* Local PostProcessing removed for performance - handled by App.tsx */}
        </group>
    )
}

function OrganicCluster({ count, mouseVec }: { count: number, mouseVec: THREE.Vector3 }) {
    const group = useRef<THREE.Group>(null)

    // Generate static random data for positions
    const nodes = useMemo(() => new Array(count).fill(0).map(() => ({
        pos: new THREE.Vector3(
            (Math.random() - 0.5) * 15,
            (Math.random() - 0.5) * 20,
            (Math.random() - 0.5) * 15
        ),
        offset: Math.random() * 100
    })), [count])

    // Update individual shader instances? No, too expensive for JS loop with custom shader uniforms if distinct.
    // Instead, we use individual meshes for the 'High-Quality' feel requested (Hyper-Realism), 
    // unless count is massive. 150 meshes is fine for modern GPU.

    return (
        <group ref={group}>
            {nodes.map((n, i) => (
                <OrganicNode key={i} position={n.pos} offset={n.offset} mouseVec={mouseVec} />
            ))}
            {/* Connective Tissue (Lines) */}
        </group>
    )
}

function OrganicNode({ position, offset, mouseVec }: { position: THREE.Vector3, offset: number, mouseVec: THREE.Vector3 }) {
    const ref = useRef<THREE.Mesh>(null)
    // @ts-ignore
    const materialRef = useRef<THREE.ShaderMaterial>(null)

    const [localPos] = useState(position.clone())

    useFrame((state) => {
        if (!ref.current || !materialRef.current) return
        const t = state.clock.elapsedTime

        // Material Uniforms
        materialRef.current.uniforms.uTime.value = t + offset

        // Attraction to mouse (Chaos influence)
        // Convert mouseVec (world relative to center) to local space interaction?
        // Let's just pass world mouse to shader for the bulge, but handle position lerp here.
        const dist = localPos.distanceTo(mouseVec.clone().add(new THREE.Vector3(12, 0, 0))) // Adjust for group offset

        if (dist < 8) {
            const dir = mouseVec.clone().add(new THREE.Vector3(12, 0, 0)).sub(localPos).normalize()
            ref.current.position.lerp(localPos.clone().add(dir), 0.05)
        } else {
            // Return home drift
            ref.current.position.lerp(localPos, 0.02)
            ref.current.position.y += Math.sin(t + offset) * 0.002
        }
    })

    return (
        <mesh ref={ref} position={localPos} scale={[0.8, 0.8, 0.8]}>
            <icosahedronGeometry args={[1, 2]} />
            {/* @ts-ignore */}
            <organicMaterial ref={materialRef} transparent />
        </mesh>
    )
}

function SyntheticCluster({ count }: { count: number }) {
    // Holographic Cubes are lighter, can use instancing if we want, but for custom shader variation let's map.
    // Actually let's use a nice grid layout.

    const nodes = useMemo(() => {
        const arr = []
        const dim = Math.pow(count, 1 / 3)
        // Create a roughly cubic grid
        for (let i = 0; i < count; i++) {
            arr.push({
                pos: new THREE.Vector3(
                    (Math.random() - 0.5) * 15,
                    (Math.random() - 0.5) * 20,
                    (Math.random() - 0.5) * 15
                ),
                snapPos: new THREE.Vector3(
                    Math.round((Math.random() - 0.5) * 4) * 3,
                    Math.round((Math.random() - 0.5) * 6) * 3,
                    Math.round((Math.random() - 0.5) * 4) * 3
                )
            })
        }
        return arr
    }, [count])

    return (
        <group>
            {nodes.map((n, i) => (
                <SyntheticNode key={i} targetPos={n.snapPos} initialPos={n.pos} />
            ))}
        </group>
    )
}

function SyntheticNode({ targetPos, initialPos }: { targetPos: THREE.Vector3, initialPos: THREE.Vector3 }) {
    const ref = useRef<THREE.Mesh>(null)
    // @ts-ignore
    const matRef = useRef<THREE.ShaderMaterial>(null)
    const [isSnapping, setSnapping] = useState(false)

    useFrame((state) => {
        if (!ref.current || !matRef.current) return
        matRef.current.uniforms.uTime.value = state.clock.elapsedTime

        // Simulation: Drifts, then snaps to grid
        if (Math.random() > 0.99) setSnapping(!isSnapping)

        if (isSnapping) {
            ref.current.position.lerp(targetPos, 0.1)
            ref.current.rotation.set(0, 0, 0)
        } else {
            // Drift chaos
            ref.current.position.lerp(initialPos, 0.01)
            ref.current.rotation.x += 0.01
            ref.current.rotation.y += 0.01
        }
    })

    return (
        <mesh ref={ref} position={initialPos}>
            <boxGeometry args={[1, 1, 1]} />
            {/* @ts-ignore */}
            <hologramMaterial ref={matRef} transparent side={THREE.DoubleSide} depthWrite={false} />
            <Line points={[[0, 0, 0], targetPos.clone().sub(initialPos).divideScalar(2)]} color="cyan" transparent opacity={0.2} />
        </mesh>
    )

}

function SynapticBridge() {
    const ref = useRef<THREE.Group>(null)
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y -= 0.01
        }
    })

    return (
        <group ref={ref}>
            {/* Black Hole Core */}
            <mesh>
                <sphereGeometry args={[2, 32, 32]} />
                <meshBasicMaterial color="black" />
            </mesh>

            {/* Accretion Disk / Lens */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[4, 0.1, 16, 100]} />
                <meshBasicMaterial color="white" />
            </mesh>

            {/* Distortion Field */}
            <mesh scale={[1.2, 1.2, 1.2]}>
                <sphereGeometry args={[3, 32, 32]} />
                <MeshTransmissionMaterial
                    backside
                    thickness={2}
                    chromaticAberration={1}
                    anisotropy={1}
                    distortion={2}
                    distortionScale={0.5}
                    temporalDistortion={2}
                    color="white"
                    background={new THREE.Color('black')}
                />
            </mesh>

            {/* Volumetric Particles Spiraling */}
            <Sparkles count={500} scale={10} size={5} speed={2} noise={1} color="#ff00ff" />
        </group>
    )
}

function DataStreams({ mouseVec }: { mouseVec: THREE.Vector3 }) {
    return (
        <>
            {/* Particles flowing from Left (Bio) to Right (Synth) */}
            {new Array(10).fill(0).map((_, i) => (
                <StreamPacket key={i} offset={i} />
            ))}
        </>
    )
}

function StreamPacket({ offset }: { offset: number }) {
    const ref = useRef<THREE.Group>(null)
    const [speed] = useState(0.2 + Math.random() * 0.2)
    const [yOffset] = useState((Math.random() - 0.5) * 10)

    useFrame((state) => {
        if (!ref.current) return
        const t = state.clock.elapsedTime
        const progress = (t * speed + offset) % 2 // Loop 0-2 (Left to Right and back-ish)

        // Path: -15 (Left) -> 15 (Right)
        // x goes from -15 to 15
        let x = -15 + (progress) * 15
        if (x > 15) x = -15 // Reset

        // Y follows a sine wave + pinch at center
        const pinch = 1 - Math.exp(-Math.pow(x, 2) * 0.1) // 0 at center, 1 at edges
        const y = Math.sin(x * 0.5 + t * 5) * 2 * pinch + yOffset * pinch

        ref.current.position.set(x, y, 0)

        // Scale down at center (singularity compression)
        const s = 1 - (1 - pinch) * 0.8
        ref.current.scale.set(s, s, s)
    })

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[0.3, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>
            <Trail width={2} length={8} color={new THREE.Color(2, 0.5, 1)} attenuation={(t) => t * t}>
                <mesh visible={false} />
            </Trail>
        </group>
    )
}
