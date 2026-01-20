import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Text } from '@react-three/drei';

export interface AgentData {
    id: number;
    name: string;
    orbitRadius: number;
    speed: number;
    inclination: number;
    phase: number;
    type: 'OBSERVER' | 'SENTINEL' | 'ARCHITECT';
    status: 'ACTIVE' | 'SCANNING' | 'IDLE';
    position: THREE.Vector3;
}

interface UniversalAgentOverlayProps {
    observer: THREE.Vector2;
    onSelectAgent?: (agent: AgentData | null) => void;
    selectedAgentId?: number | null;
}

export default function UniversalAgentOverlay({ observer, onSelectAgent, selectedAgentId }: UniversalAgentOverlayProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const orbitLinesRef = useRef<THREE.Group>(null);
    const count = 60;
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    // DETERMINISTIC AGENT GENERATION
    const agents = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => {
            const typeProb = Math.random();
            const type = typeProb > 0.8 ? 'ARCHITECT' : typeProb > 0.4 ? 'SENTINEL' : 'OBSERVER';
            return {
                id: i,
                name: `${type}_${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
                orbitRadius: 15 + Math.random() * 40,
                speed: (0.05 + Math.random() * 0.1) * (Math.random() > 0.5 ? 1 : -1),
                inclination: (Math.random() - 0.5) * Math.PI, // Full 3D orbits
                phase: Math.random() * Math.PI * 2,
                type: type,
                status: 'ACTIVE',
                position: new THREE.Vector3()
            } as AgentData;
        });
    }, []);

    // Temp objects to avoid GC
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const focusTarget = useMemo(() => new THREE.Vector3(), []);
    const color = useMemo(() => new THREE.Color(), []);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();

        agents.forEach((agent, i) => {
            // KEPLERIAN ORBIT CALCULATION (Simplified Circular with Inclination)
            const angle = agent.phase + t * agent.speed;

            // Calculate 3D position based on orbit parameters
            const x = Math.cos(angle) * agent.orbitRadius;
            const z = Math.sin(angle) * agent.orbitRadius;

            // Apply inclination to Y
            const y = x * Math.sin(agent.inclination) + z * Math.cos(agent.inclination) * 0.5;

            // Update stored position for external use
            agent.position.set(x, y, z);

            // Update Instance Matrix
            dummy.position.copy(agent.position);

            // Face the center (singularity) or velocity vector?
            // Let's face velocity vector for "flying" effect
            const nextAngle = angle + 0.1; // modest look-ahead
            const nextX = Math.cos(nextAngle) * agent.orbitRadius;
            const nextZ = Math.sin(nextAngle) * agent.orbitRadius;
            const nextY = nextX * Math.sin(agent.inclination) + nextZ * Math.cos(agent.inclination) * 0.5;
            focusTarget.set(nextX, nextY, nextZ);
            dummy.lookAt(focusTarget);

            // Scale effect on selection/hover
            const isSelected = selectedAgentId === agent.id;
            const isHovered = hoveredId === agent.id;
            const baseScale = isSelected ? 1.5 : (isHovered ? 1.2 : 0.8);
            dummy.scale.setScalar(baseScale);

            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // COLOR CODING
            if (isSelected) color.setHex(0xff00ff); // Magenta for Selected
            else if (isHovered) color.setHex(0x00ffff); // Cyan for Hover
            else if (agent.type === 'ARCHITECT') color.setHex(0xffaa00);
            else if (agent.type === 'SENTINEL') color.setHex(0xff4444);
            else color.setHex(0x0088ff); // Observer Blue

            meshRef.current!.setColorAt(i, color);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, count]}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHoveredId(e.instanceId!);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                    setHoveredId(null);
                    document.body.style.cursor = 'default';
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    const id = e.instanceId;
                    if (id !== undefined && onSelectAgent) {
                        onSelectAgent(agents[id]);
                    }
                }}
            >
                {/* Advanced Drone Geometry */}
                <octahedronGeometry args={[0.5, 0]} />
                <meshStandardMaterial
                    vertexColors
                    toneMapped={false}
                    emissive={new THREE.Color("#000000")} // Rely on vertex colors? No, InstancedMesh uses color logic differently.
                    // Actually standard material needs explicit emissive management or we rely on lights.
                    // Let's use MeshBasic for "Holographic" look or Standard with high metalness
                    roughness={0.2}
                    metalness={0.8}
                />
            </instancedMesh>

            {/* Render Orbit Lines for Selected Agent */}
            {selectedAgentId !== null && selectedAgentId !== undefined && (
                <SelectedAgentOrbit agent={agents.find(a => a.id === selectedAgentId)!} />
            )}

            {/* Neural Connections between nearby agents */}
            <NeuralLinks agents={agents} />
        </group>
    );
}

// Visualizer for the specific orbit of the selected agent
function SelectedAgentOrbit({ agent }: { agent: AgentData }) {
    const points = useMemo(() => {
        const pts = [];
        for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * Math.PI * 2;
            const x = Math.cos(angle) * agent.orbitRadius;
            const z = Math.sin(angle) * agent.orbitRadius;
            const y = x * Math.sin(agent.inclination) + z * Math.cos(agent.inclination) * 0.5;
            pts.push(new THREE.Vector3(x, y, z));
        }
        return new THREE.BufferGeometry().setFromPoints(pts);
    }, [agent]);

    return (
        <line geometry={points}>
            <lineBasicMaterial color="#ff00ff" transparent opacity={0.6} linewidth={2} />
        </line>
    )
}

function NeuralLinks({ agents }: { agents: AgentData[] }) {
    const linesRef = useRef<THREE.LineSegments>(null);

    useFrame(() => {
        if (!linesRef.current) return;

        // This calculates connections every frame. 
        // OPTIMIZATION: Only do this for a subset or reduce checking radius.
        const linePositions = [];
        // Limit connections to avoid performance hit
        let connections = 0;

        for (let i = 0; i < agents.length; i++) {
            // Optimization: Only check neighbors in array to avoid O(N^2) full scan
            // Or just check random subset? 
            // Let's check typical "swarm" behavior 

            for (let j = i + 1; j < agents.length; j++) {
                if (Math.abs(agents[i].orbitRadius - agents[j].orbitRadius) > 5) continue; // Skip if orbits are far apart

                const distSq = agents[i].position.distanceToSquared(agents[j].position);
                if (distSq < 100) { // Distance < 10
                    linePositions.push(
                        agents[i].position.x, agents[i].position.y, agents[i].position.z,
                        agents[j].position.x, agents[j].position.y, agents[j].position.z
                    );
                    connections++;
                    if (connections > 200) break; // Hard limit lines
                }
            }
            if (connections > 200) break;
        }

        // Must update geometry attribute
        linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#00ffff" transparent opacity={0.15} blending={THREE.AdditiveBlending} depthWrite={false} />
        </lineSegments>
    );
}

