import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Float, Instance, Instances, Billboard } from '@react-three/drei';
import CodeRain from './CodeRain';

export default function MatrixUniverse({ chaos = 0 }: { chaos?: number }) {
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const observer = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    // Track mouse as "The Anomaly"
    const x = state.mouse.x * 50;
    const y = state.mouse.y * 30;
    observer.current.set(x, y, 0);

    // Chaos increases if Sentinels are close (simulated state)
    // Or if user moves mouse too fast (high chaos prop)
    if (chaos > 0.5) setAnomalyDetected(true);
    else setAnomalyDetected(false);
  });

  return (
    <group>
      {/* 1. The Data Cathedral (Walls of Code) */}
      <DataCathedral anomaly={anomalyDetected} />

      {/* 2. The Architect (Central Interface) */}
      <TheArchitect anomaly={anomalyDetected} observer={observer} />

      {/* 3. Logic Glitches (Visual Corruption) */}
      <GlitchAnomalies count={50} chaos={chaos} />
      <CodeRain anomaly={anomalyDetected} />

      {/* 4. The Sentinel System (Hunters) */}
      <SentinelSwarm target={observer} count={5} />

      {/* 5. System Status */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Billboard position={[0, 30, -40]}>
          <Text fontSize={3} color={anomalyDetected ? "#ff0000" : "#00ff66"} font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="center" outlineWidth={0.1} outlineColor="#000000">
            {anomalyDetected ? "SYSTEM ALERT // ANOMALY DETECTED" : "MATRIX // ARCHITECT_ONLINE"}
          </Text>
        </Billboard>
      </Float>

      {/* 6. The Fabric of Reality (Floor) */}
      <SpacetimeFabric chaos={chaos} anomaly={anomalyDetected} />
    </group>
  );
}

function DataCathedral({ anomaly }: { anomaly: boolean }) {
  // Massive pillars of scrolling code forming a cathedral-like structure
  const count = 16;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current) return;

    // Update shader uniforms manually via onBeforeCompile/Material prop or just rotation here
    // For instanced mesh shader simulation, we act on the group

    // Rotate the entire cathedral slowly
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.02;
  })

  const pillars = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radius = 60;
      return {
        position: new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
        rotation: new THREE.Euler(0, -angle, 0),
        scale: new THREE.Vector3(5, 120, 5)
      }
    })
  }, []);

  useFrame(() => {
    if (meshRef.current) {
      pillars.forEach((p, i) => {
        dummy.position.copy(p.position);
        dummy.rotation.copy(p.rotation);
        dummy.scale.copy(p.scale);
        dummy.updateMatrix();
        meshRef.current!.setMatrixAt(i, dummy.matrix);
      });
      meshRef.current.instanceMatrix.needsUpdate = true;
    }
  })

  // Custom Shader for Scrolling Code on Pillars
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(anomaly ? "#ff0000" : "#00ff44") }
    },
    vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            varying vec2 vUv;
            uniform float uTime;
            uniform vec3 uColor;

            float random(vec2 st) {
                return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
            }

            void main() {
                vec2 st = vUv;
                // Scroll down
                st.y += uTime * 0.5;
                
                // Grid for characters
                vec2 grid = floor(st * vec2(10.0, 50.0));
                float r = random(grid);
                
                // Active characters
                float char = step(0.8, fract(r + uTime)); // Blinking
                float trail = step(0.95, random(vec2(grid.x, floor(uTime * 10.0 + grid.y)))); // Rain drops

                vec3 color = uColor * (char + trail * 2.0);
                
                // Alpha fade at top/bottom
                float alpha = (char + trail) * smoothstep(0.0, 0.2, vUv.y) * smoothstep(1.0, 0.8, vUv.y);

                gl_FragColor = vec4(color, alpha * 0.8);
            }
        `,
    transparent: true,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  }), [anomaly]);

  useFrame((state) => {
    if (material) {
      material.uniforms.uTime.value = state.clock.elapsedTime;
      material.uniforms.uColor.value.set(anomaly ? '#ff0000' : '#00ff44');
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <primitive object={material} attach="material" />
    </instancedMesh>
  )
}

function TheArchitect({ anomaly, observer }: { anomaly: boolean, observer: React.MutableRefObject<THREE.Vector3> }) {
  // A giant face/grid representation of the system Intelligence
  const groupRef = useRef<THREE.Group>(null);
  const particles = useMemo(() => {
    const p = [];
    for (let i = 0; i < 500; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 15;
      p.push({
        pos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        ),
        basePos: new THREE.Vector3(
          r * Math.sin(phi) * Math.cos(theta),
          r * Math.sin(phi) * Math.sin(theta),
          r * Math.cos(phi)
        )
      });
    }
    return p;
  }, []);

  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!meshRef.current || !groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Look at user
    groupRef.current.lookAt(observer.current.x, observer.current.y * 0.5, 50);

    particles.forEach((p, i) => {
      // Face Morphing Logic
      // If normal, it's a sphere. If anomaly, it spikes.
      const noise = Math.sin(t * 2.0 + p.basePos.x) * (anomaly ? 5.0 : 1.0);

      dummy.position.copy(p.basePos).multiplyScalar(1.0 + noise * 0.05);
      dummy.scale.setScalar(0.2 + (anomaly ? Math.random() * 0.5 : 0));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef} position={[0, 10, -50]}>
      <instancedMesh ref={meshRef} args={[undefined, undefined, 500]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={anomaly ? "#ff0000" : "#ffffff"} wireframe transparent opacity={0.3} />
      </instancedMesh>
      <pointLight color={anomaly ? "#ff0000" : "#00ff44"} distance={50} intensity={2} />
    </group>
  )
}

function GlitchAnomalies({ count, chaos }: { count: number, chaos: number }) {
  // Random red blocks appearing in space
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const [positions] = useState(() => new Array(count).fill(0).map(() => new THREE.Vector3(
    (Math.random() - 0.5) * 100, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50
  )));

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    positions.forEach((pos, i) => {
      // Only visible sometimes based on chaos
      const visible = Math.sin(t * 10.0 + i) > (0.9 - chaos * 0.5);

      if (visible) {
        dummy.position.copy(pos);
        dummy.scale.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
      } else {
        dummy.scale.set(0, 0, 0);
      }
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color="#ff0000" wireframe />
    </instancedMesh>
  )
}

function SpacetimeFabric({ chaos, anomaly }: { chaos: number, anomaly: boolean }) {
  // The "Floor" of the universe where code impacts reality
  const meshRef = useRef<THREE.Mesh>(null);

  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uChaos: { value: 0 },
      uColor: { value: new THREE.Color('#00ff44') },
      uImpactColor: { value: new THREE.Color('#ffffff') }
    },
    vertexShader: `
            uniform float uTime;
            uniform float uChaos;
            varying vec2 vUv;
            varying float vDisp;

            // Simplex Noise (simplified)
            vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
            vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
                vec2 i  = floor(v + dot(v, C.yy) );
                vec2 x0 = v - i + dot(i, C.xx);
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                i = mod289(i);
                vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m ;
                m = m*m ;
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }

            void main() {
                vUv = uv;
                vec3 pos = position;
                
                // Digital Ripple Effect
                // We simulate "code" hitting the floor at random intervals
                float noise = snoise(pos.xy * 0.1 + uTime * 0.5);
                float ripple = sin(length(pos.xy) * 0.5 - uTime * 2.0) * exp(-length(pos.xy) * 0.05);
                
                // Chaos adds more erratic spikes (Glitch in the Fabric)
                float glitch = snoise(pos.xy * 0.5 + uTime * 5.0) * uChaos;

                pos.z += (ripple * 2.0 + noise * 1.0 + glitch * 3.0);
                vDisp = pos.z;

                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
    fragmentShader: `
            uniform float uTime;
            uniform vec3 uColor;
            uniform vec3 uImpactColor;
            varying vec2 vUv;
            varying float vDisp;

            void main() {
                // Grid Pattern
                float gridX = step(0.98, fract(vUv.x * 50.0));
                float gridY = step(0.98, fract(vUv.y * 50.0));
                float grid = max(gridX, gridY);

                // Impact Rings
                float ring = step(0.4, sin(vDisp * 2.0 - uTime * 5.0));
                
                vec3 finalColor = mix(uColor, uImpactColor, ring * 0.5);
                
                // Opacity fades at edges
                float alpha = (grid + ring * 0.3) * (1.0 - length(vUv - 0.5) * 1.5);

                gl_FragColor = vec4(finalColor, alpha);
            }
        `
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uChaos.value = chaos;
      mat.uniforms.uColor.value.set(anomaly ? '#ff0000' : '#00ff44');
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -15, -40]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[100, 100, 64, 64]} />
      <shaderMaterial
        {...shader}
        transparent
        side={THREE.DoubleSide}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function SentinelSwarm({ target, count }: { target: React.MutableRefObject<THREE.Vector3>, count: number }) {
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Each sentinel has a position and velocity
  const agents = useMemo(() => new Array(count).fill(0).map(() => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, -20 + Math.random() * 20),
    vel: new THREE.Vector3(0, 0, 0),
    offset: Math.random() * 100
  })), [count]);

  useFrame((state) => {
    if (!meshRef.current) return;

    agents.forEach((agent, i) => {
      // Seek Target (The Mouse)
      const desired = new THREE.Vector3().subVectors(target.current, agent.pos);
      const dist = desired.length();
      desired.normalize().multiplyScalar(0.5); // Max speed

      // Steer
      const steer = new THREE.Vector3().subVectors(desired, agent.vel);
      steer.clampLength(0, 0.02); // Max force

      agent.vel.add(steer);
      agent.pos.add(agent.vel);

      // Orbit if close to avoid stacking
      if (dist < 10) {
        agent.pos.x += Math.sin(state.clock.elapsedTime * 2 + agent.offset) * 0.2;
        agent.pos.y += Math.cos(state.clock.elapsedTime * 2 + agent.offset) * 0.2;
      }

      // Look at target
      dummy.position.copy(agent.pos);
      dummy.lookAt(target.current);
      dummy.scale.set(1.5, 1.5, 3.0); // Spiky shape
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} roughness={0.2} metalness={0.8} />
    </instancedMesh>
  );
}
