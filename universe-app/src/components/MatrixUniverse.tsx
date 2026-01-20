import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text, Float, Instance, Instances } from '@react-three/drei';

export default function MatrixUniverse({ chaos = 0 }: { chaos?: number }) {
  const [anomalyDetected, setAnomalyDetected] = useState(false);
  const observer = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    // Track mouse as "The Anomaly"
    const x = state.mouse.x * 50;
    const y = state.mouse.y * 30;
    observer.current.set(x, y, 0);

    // Chaos increases if Sentinels are close (simulated state)
    if (chaos > 0.5) setAnomalyDetected(true);
    else setAnomalyDetected(false);
  });

  return (
    <group>
      {/* 1. The Endless Code Tunnel */}
      <CodeTunnel anomaly={anomalyDetected} />

      {/* 2. Floating Glyph Instances (Foreground Detail) */}
      <VolumetricSymbols count={200} anomaly={anomalyDetected} />

      {/* 3. The Sentinel System (Hunters) */}
      <SentinelSwarm target={observer} count={5} />

      {/* 4. System Status */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2}>
        <Text position={[0, 25, -20]} fontSize={2} color={anomalyDetected ? "#ff0000" : "#00ff66"} font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="center">
          {anomalyDetected ? "SYSTEM ALERT // ANOMALY DETECTED" : "MATRIX // SIMULATION_STABLE"}
        </Text>
      </Float>

      {/* 5. The Fabric of Reality (Interacting with Code) */}
      <SpacetimeFabric chaos={chaos} anomaly={anomalyDetected} />
    </group>
  );
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

function CodeTunnel({ anomaly }: { anomaly: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const shader = useMemo(() => ({
    uniforms: {
      uTime: { value: 0 },
      uColor: { value: new THREE.Color(anomaly ? '#ff0000' : '#00ff44') },
      uSpeed: { value: 1.0 }
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPos;
      void main() {
        vUv = uv;
        vPos = position;
        // Curvature effect for tunnel
        vec3 pos = position;
        pos.z -= length(pos.xy) * 0.5; 
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec3 uColor;
      varying vec2 vUv;
      
      float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
      }

      void main() {
        // Scroll Y
        vec2 st = vUv;
        st.y += uTime * 0.2;
        
        // Grid cells
        vec2 grid = floor(st * vec2(30.0, 10.0));
        
        // Binary rain pattern
        float r = random(grid);
        float rain = step(0.9, fract(r + uTime * 0.5)); // Droplets
        
        // Trail
        float trail = smoothstep(0.0, 1.0, fract(r + uTime * 0.2));
        
        // Glitch line
        float glitch = step(0.98, random(vec2(0.0, floor(vUv.y * 100.0) + floor(uTime * 20.0))));

        vec3 color = uColor * (rain + trail * 0.5);
        color += vec3(1.0) * glitch; // White flash glitch

        gl_FragColor = vec4(color, (rain + trail) * 0.5);
      }
    `
  }), [anomaly]);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z += 0.001;
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      mat.uniforms.uTime.value = state.clock.elapsedTime;
      mat.uniforms.uColor.value.set(anomaly ? '#ff0000' : '#00ff44');
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, -40]}>
      {/* Huge cylinder surrounding the view */}
      <cylinderGeometry args={[50, 50, 200, 32, 1, true]} />
      <primitive object={new THREE.ShaderMaterial({ ...shader, side: THREE.BackSide, transparent: true, blending: THREE.AdditiveBlending })} attach="material" />
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

function VolumetricSymbols({ count, anomaly }: { count: number, anomaly: boolean }) {
  // 3D falling code characters
  const groupRef = useRef<THREE.Group>(null);
  const symbols = useMemo(() => "01XYZ<>?Matrix", []);

  const parts = useMemo(() => new Array(count).fill(0).map(() => ({
    x: (Math.random() - 0.5) * 80,
    y: (Math.random() - 0.5) * 60,
    z: (Math.random() - 0.5) * 40,
    speed: 2 + Math.random() * 5,
    char: symbols[Math.floor(Math.random() * symbols.length)]
  })), [count]);

  return (
    <group ref={groupRef}>
      {parts.map((p, i) => (
        <MovingSymbol key={i} {...p} anomaly={anomaly} />
      ))}
    </group>
  );
}

function MovingSymbol({ x, y, z, speed, char, anomaly }: any) {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y -= speed * 0.1;
      if (ref.current.position.y < -30) ref.current.position.y = 30; // Loop
      ref.current.rotation.y = state.clock.elapsedTime;
    }
  });

  return (
    <group ref={ref} position={[x, y, z]}>
      <Text
        fontSize={1.5}
        color={anomaly ? "#ff0000" : "#00ff44"}
        font="/fonts/Roboto-VariableFont_wdth,wght.ttf"
        anchorX="center"
        anchorY="middle"
      >
        {char}
      </Text>
    </group>
  );
}

function TheCompiler({ anomaly }: { anomaly: boolean }) {
  // The "Source" - A wireframe sphere constructing reality
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.5;
      ref.current.rotation.x = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <group ref={ref} position={[0, 0, -10]}>
      {/* Core */}
      <mesh>
        <icosahedronGeometry args={[4, 2]} />
        <meshBasicMaterial color={anomaly ? "#ff0000" : "#00ff44"} wireframe wireframeLinewidth={2} transparent opacity={0.3} />
      </mesh>
      {/* Scanning Shell */}
      <mesh scale={1.2}>
        <sphereGeometry args={[4, 32, 32]} />
        <meshBasicMaterial color={anomaly ? "#ff0000" : "#00ffff"} wireframe transparent opacity={0.1} />
      </mesh>
      <Text position={[0, 0, 0]} fontSize={0.5} color="#ffffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
        {anomaly ? "CRITICAL ERROR" : "COMPILING..."}
      </Text>
    </group>
  );
}

function SystemLogs({ anomaly }: { anomaly: boolean }) {
  const logs = [
    "[KERNEL] LOADING_PHYSICS_ENGINE...",
    "[RENDER] PROCESSING_GEOMETRY...",
    "[NET] SYNCHRONIZING_NODES...",
    "[A.I.] SENTINEL_SYSTEM_ONLINE",
    "[MEM] ALLOCATING_VIRTUAL_SPACE",
    "[SYS] REALITY_CHECK: PASSED"
  ];

  return (
    <group>
      {logs.map((log, i) => (
        <MovingLog key={i} text={log} index={i} anomaly={anomaly} />
      ))}
    </group>
  );
}

function MovingLog({ text, index, anomaly }: { text: string, index: number, anomaly: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const speed = 2 + Math.random() * 2;
  const xOffset = (Math.random() - 0.5) * 40;

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime;
      // Move forward towards camera
      ref.current.position.z = (t * speed + index * 20) % 100 - 50;
      ref.current.position.y = Math.sin(t + index) * 5;
      ref.current.lookAt(0, 0, 100); // Always face camera generally? Or face center?
    }
  });

  return (
    <group ref={ref} position={[xOffset, 0, -50]}>
      <Billboard>
        <Text fontSize={1} color={anomaly ? "#ff0000" : "#0088ff"} font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="center">
          {text}
        </Text>
      </Billboard>
    </group>
  );
}

function SpiralCode({ count, anomaly }: { count: number, anomaly: boolean }) {
  // Code spiraling into the compiler
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => new Array(count).fill(0).map((_, i) => ({
    offset: Math.random() * 100,
    speed: 0.5 + Math.random(),
    radius: 10 + Math.random() * 20
  })), [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    particles.forEach((p, i) => {
      // Spiral math
      const angle = t * p.speed + p.offset;
      const r = p.radius * (1.0 - (Math.sin(angle * 0.1) * 0.5 + 0.5)); // Radius pulse? 
      // Better spiral: Move Inward
      const progress = (t * p.speed * 0.2 + p.offset) % 1.0; // 0 to 1
      const curRadius = 50 * (1.0 - progress); // Start far, go close

      const x = Math.cos(angle) * curRadius;
      const y = Math.sin(angle) * curRadius * 0.5; // Flattened spiral
      const z = -10 + Math.sin(angle * 2) * 5; // Wiggle

      dummy.position.set(x, y, z);
      dummy.scale.set(0.2, 0.2, 0.8);
      dummy.lookAt(0, 0, -10); // Look at compiler
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={anomaly ? "#ff0000" : "#00ff00"} transparent opacity={0.6} />
    </instancedMesh>
  );
}
