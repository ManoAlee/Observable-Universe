import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function ProceduralPlanet({ seed = 0, type = 'TERRAN', chaos = 0 }: { seed?: number, type?: 'TERRAN' | 'LAVA' | 'ICE', chaos?: number }) {
    const meshRef = useRef<THREE.Mesh>(null)
    const atmosphereRef = useRef<THREE.Mesh>(null)

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uSeed: { value: seed },
        uChaos: { value: chaos },
        uColorWater: { value: new THREE.Color(type === 'LAVA' ? '#cf1020' : type === 'ICE' ? '#aaccff' : '#0066ff') },
        uColorSand: { value: new THREE.Color(type === 'LAVA' ? '#330000' : type === 'ICE' ? '#ffffff' : '#d2b48c') },
        uColorGrass: { value: new THREE.Color(type === 'LAVA' ? '#ff4500' : type === 'ICE' ? '#ddeeFF' : '#228800') },
        uColorRock: { value: new THREE.Color(type === 'LAVA' ? '#1a0500' : type === 'ICE' ? '#8899aa' : '#555555') },
        uColorSnow: { value: new THREE.Color('#ffffff') },
        uLightDir: { value: new THREE.Vector3(5, 3, 5).normalize() }
    }), [seed, type, chaos])

    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.0005 * (1.0 + chaos * 5.0)
            const mat = meshRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = time
            mat.uniforms.uChaos.value = chaos
        }
        if (atmosphereRef.current) {
            const mat = atmosphereRef.current.material as THREE.ShaderMaterial
            mat.uniforms.uTime.value = time
        }
    })

    const planetVertex = `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying float vElevation;
        varying vec3 vWorldPos;
        uniform float uTime;
        uniform float uSeed;

        float hash(vec3 p) {
            p = fract(p * vec3(123.34, 456.21, 789.18));
            p += dot(p, p.yzx + 19.19);
            return fract((p.x + p.y) * p.z);
        }

        float noise(vec3 p) {
            vec3 i = floor(p); vec3 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            float n = mix(mix(mix(hash(i + vec3(0,0,0)), hash(i + vec3(1,0,0)), f.x),
                             mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
                         mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                             mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
            return n;
        }

        void main() {
            vNormal = normalize(normalMatrix * normal);
            vec4 worldPos = modelMatrix * vec4(position, 1.0);
            vWorldPos = worldPos.xyz;
            vViewPos = (modelViewMatrix * vec4(position, 1.0)).xyz;
            
            float elevation = 0.0;
            float freq = 1.5;
            float amp = 1.0;
            for(int i=0; i<6; i++) {
                elevation += (noise(position * freq + uSeed) - 0.5) * amp;
                freq *= 2.0;
                amp *= 0.5;
            }
            vElevation = elevation;
            
            vec3 p = position + normal * max(0.0, elevation * 0.2);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
    `

    const planetFragment = `
        varying vec3 vNormal;
        varying vec3 vViewPos;
        varying float vElevation;
        varying vec3 vWorldPos;
        uniform vec3 uColorWater;
        uniform vec3 uColorSand;
        uniform vec3 uColorGrass;
        uniform vec3 uColorRock;
        uniform vec3 uColorSnow;
        uniform vec3 uLightDir;
        uniform float uTime;
        uniform float uChaos;

        void main() {
            vec3 color = uColorWater;
            float e = vElevation;
            if (e > -0.02) color = mix(uColorSand, uColorGrass, smoothstep(-0.02, 0.05, e));
            if (e > 0.1) color = mix(uColorGrass, uColorRock, smoothstep(0.1, 0.3, e));
            if (e > 0.4) color = mix(uColorRock, uColorSnow, smoothstep(0.4, 0.6, e));

            float diffuse = max(0.0, dot(vNormal, uLightDir));
            
            // Night-side city lights
            float night = smoothstep(0.2, -0.2, dot(vNormal, uLightDir));
            vec3 lights = vec3(1.0, 0.8, 0.4) * step(0.92, fract(sin(dot(vWorldPos, vec3(12.3, 45.6, 78.9))) * 43758.5453));
            
            // Chaos corruption: Red veins
            float corruption = step(0.8, fract(vElevation * 10.0 + uTime)) * uChaos;
            color = mix(color, vec4(1.0, 0.0, 0.0, 1.0).rgb, corruption);

            vec3 finalColor = color * (diffuse + 0.1);
            finalColor += lights * night * (1.0 - uChaos); // Lights turn off in high chaos
            
            gl_FragColor = vec4(finalColor, 1.0);
        }
    `

    return (
        <group>
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 128, 128]} />
                <shaderMaterial
                    vertexShader={planetVertex}
                    fragmentShader={planetFragment}
                    uniforms={uniforms}
                />
            </mesh>

            {/* Atmosphere Shield */}
            <mesh ref={atmosphereRef} scale={[1.15, 1.15, 1.15]}>
                <sphereGeometry args={[2, 64, 64]} />
                <shaderMaterial
                    transparent
                    side={THREE.BackSide}
                    blending={THREE.AdditiveBlending}
                    uniforms={{ uTime: { value: 0 }, uLightDir: { value: uniforms.uLightDir.value } }}
                    vertexShader={`
                        varying vec3 vNormal;
                        varying vec3 vViewVec;
                        void main() {
                            vNormal = normalize(normalMatrix * normal);
                            vViewVec = normalize(modelViewMatrix * vec4(position, 1.0)).xyz;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        varying vec3 vNormal;
                        varying vec3 vViewVec;
                        uniform vec3 uLightDir;
                        void main() {
                            float rayleigh = pow(1.0 + dot(vNormal, vViewVec), 4.0);
                            float sun = max(0.0, dot(vNormal, uLightDir));
                            vec3 color = mix(vec3(0.1, 0.5, 1.0), vec3(1.0, 0.6, 0.3), pow(1.0-sun, 2.0));
                            gl_FragColor = vec4(color, rayleigh * sun * 0.5);
                        }
                    `}
                />
            </mesh>
        </group>
    )
}

