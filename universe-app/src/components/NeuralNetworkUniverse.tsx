import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Float, Html } from '@react-three/drei'
import * as THREE from 'three'

interface NeuralNetworkUniverseProps {
    observer: THREE.Vector2
    entropy: number
    lssiData?: {
        solar: { kp_index: number, risk: string }
        seismic: { count: number, max_magnitude: number }
        neo: { count: number, hazard: boolean }
        lssi: number
    }
}

// Node Health States
type NodeState = 'HEALTHY' | 'INFECTED' | 'ZOMBIE'

export default function NeuralNetworkUniverse({ observer, entropy, lssiData }: NeuralNetworkUniverseProps) {
    // Determine Global System Integrity based on LSSI
    const systemIntegrity = Math.max(0, 100 - (lssiData?.lssi || 0) * 100);
    const integrityColor = systemIntegrity > 80 ? '#00ff88' : systemIntegrity > 50 ? '#ffff00' : '#ff0000';

    return (
        <group>
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#00ffff" />

            <CarbonCivilization lssiData={lssiData} integrityColor={integrityColor} />

            {/* HUD / System Monitor Label */}
            <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
                <group position={[0, 40, -50]}>
                    <Text fontSize={4} color={integrityColor} font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="center" anchorY="bottom">
                        CIVILIZATION_OS // INTEGRITY: {systemIntegrity.toFixed(1)}%
                    </Text>
                    <Text fontSize={2} position={[0, -3, 0]} color="#aaaaaa" font="/fonts/Roboto-VariableFont_wdth,wght.ttf" anchorX="center" anchorY="top">
                        [CLICK NODES TO DEBUG MALWARE]
                    </Text>
                </group>
            </Float>
        </group>
    )
}

function CarbonCivilization({ lssiData, integrityColor }: { lssiData: any, integrityColor: string }) {
    // Derive chaos level from multiple sources
    const solarChaos = (lssiData?.solar?.kp_index || 0) / 9;
    const seismicChaos = (lssiData?.seismic?.max_magnitude || 0) / 9;

    // Pulse speed = Processing Cycle Speed
    const processingSpeed = 1.0 + (lssiData?.lssi || 0) * 8.0;

    return (
        <group>
            {/* INPUT SECTORS (The Senses) */}
            <CivilizationSector
                count={50} x={-30} yOffset={15}
                baseColor={solarChaos > 0.5 ? '#ff4400' : '#0088ff'}
                label="SOLAR_DOWNLINK"
                infectionRate={solarChaos}
            />
            <CivilizationSector
                count={50} x={-30} yOffset={0}
                baseColor="#00ffee"
                label="NEO_TRACKING_API"
                infectionRate={0.1}
            />
            <CivilizationSector
                count={50} x={-30} yOffset={-15}
                baseColor={seismicChaos > 0.5 ? '#ff0055' : '#4400ff'}
                label="SEISMIC_FEED"
                infectionRate={seismicChaos}
            />

            {/* PROCESSING CLUSTERS (The Population) */}
            <CivilizationSector
                count={200} x={-10}
                baseColor="#aa00ff"
                label="DEEP_LEARNING_CLUSTER_A"
                infectionRate={0.2 + (lssiData?.lssi || 0)}
            />
            <CivilizationSector
                count={200} x={10}
                baseColor="#ff00aa"
                label="DEEP_LEARNING_CLUSTER_B"
                infectionRate={0.2 + (lssiData?.lssi || 0)}
            />

            {/* OUTPUT (System Decisions) */}
            <CivilizationSector
                count={60} x={30}
                baseColor={integrityColor}
                label="DECISION_MATRIX"
                infectionRate={0.0}
            />

            {/* DATA FLOW (The Economy) */}
            <DataHighways layerFrom={{ x: -30 }} layerTo={{ x: -10 }} speed={processingSpeed} color="#ffffff" count={200} />
            <DataHighways layerFrom={{ x: -10 }} layerTo={{ x: 10 }} speed={processingSpeed} color="#aa00ff" count={400} />
            <DataHighways layerFrom={{ x: 10 }} layerTo={{ x: 30 }} speed={processingSpeed} color={integrityColor} count={200} />
        </group>
    )
}

function CivilizationSector({ count, x, baseColor, label, yOffset = 0, infectionRate }: { count: number, x: number, baseColor: string, label?: string, yOffset?: number, infectionRate: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const colorHelper = useMemo(() => new THREE.Color(), []);

    // Initialize Citizen States
    const [nodeStates, setNodeStates] = useState<NodeState[]>(() =>
        new Array(count).fill('HEALTHY').map(() => Math.random() < 0.1 ? 'ZOMBIE' : 'HEALTHY')
    );

    // Initial Positions
    const positions = useMemo(() => {
        const pos = [];
        for (let i = 0; i < count; i++) {
            const yRange = 15;
            const yBase = (Math.random() - 0.5) * yRange + yOffset;
            pos.push({
                y: yBase,
                z: (Math.random() - 0.5) * 60,
                speed: 0.5 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2
            });
        }
        return pos;
    }, [count, yOffset]);

    // Handle Infection Spread & Recovery
    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;

        // Randomly infect nodes based on infectionRate
        if (Math.random() < 0.01) { // 1% chance per frame to check for new infection
            const victimIdx = Math.floor(Math.random() * count);
            if (nodeStates[victimIdx] === 'HEALTHY' && Math.random() < infectionRate * 0.1) {
                const newStates = [...nodeStates];
                newStates[victimIdx] = 'INFECTED';
                setNodeStates(newStates);
            }
        }

        positions.forEach((pos, i) => {
            const nodeState = nodeStates[i];

            // Movement Logic
            let posX = x;
            let posY = pos.y + Math.sin(t * pos.speed + pos.phase) * 0.5;
            let posZ = pos.z + Math.cos(t * pos.speed * 0.5 + pos.phase) * 0.5;
            let scale = 1.0;

            // State-Specific Behavior
            if (nodeState === 'INFECTED') {
                // Glitch / Shaking
                posX += (Math.random() - 0.5) * 0.5;
                posY += (Math.random() - 0.5) * 0.5;
                posZ += (Math.random() - 0.5) * 0.5;
                colorHelper.set('#ff0000'); // Malware Red
            } else if (nodeState === 'ZOMBIE') {
                // Static / Slow
                posY = pos.y; // No movement
                posZ = pos.z;
                scale = 0.8;
                colorHelper.set('#555555'); // Dead Gray
            } else {
                // Healthy
                scale = 1 + Math.sin(t * 3 + i) * 0.1;
                colorHelper.set(baseColor);
            }

            dummy.position.set(posX, posY, posZ);
            dummy.scale.set(scale, scale, scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
            meshRef.current!.setColorAt(i, colorHelper);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    const handleDebug = useCallback((e: THREE.Event) => {
        e.stopPropagation();
        const instanceId = e.instanceId;
        if (typeof instanceId === 'number' && nodeStates[instanceId] === 'INFECTED') {
            const newStates = [...nodeStates];
            newStates[instanceId] = 'HEALTHY'; // Patch applied
            setNodeStates(newStates);
            // Visual feedback could be added here (sound, particle burst)
        }
    }, [nodeStates]);

    const material = useMemo(() => new THREE.MeshPhysicalMaterial({
        vertexColors: true, // IMPORTANT: Enable per-instance colors
        roughness: 0.2,
        metalness: 0.1,
        transmission: 0.2,
        thickness: 0.5,
        clearcoat: 1.0,
        toneMapped: false,
        emissiveIntensity: 3.0
    }), []);

    return (
        <group>
            <instancedMesh
                ref={meshRef}
                args={[undefined, undefined, count]}
                onClick={handleDebug}
                onPointerOver={() => document.body.style.cursor = 'crosshair'}
                onPointerOut={() => document.body.style.cursor = 'default'}
            >
                <sphereGeometry args={[0.8, 16, 16]} />
                <primitive object={material} attach="material" />
            </instancedMesh>
            {label && (
                <Text position={[x, yOffset + 12, 0]} fontSize={1.5} color={baseColor} font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                    {label}
                </Text>
            )}
        </group>
    );
}

function DataHighways({ layerFrom, layerTo, speed, color, count }: { layerFrom: { x: number }, layerTo: { x: number }, speed: number, color: string, count: number }) {
    const linesRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const packets = useMemo(() => {
        return new Array(count).fill(0).map(() => ({
            y1: (Math.random() - 0.5) * 60,
            z1: (Math.random() - 0.5) * 60,
            y2: (Math.random() - 0.5) * 60,
            z2: (Math.random() - 0.5) * 60,
            speed: 0.5 + Math.random(),
            offset: Math.random() * 10
        }));
    }, [count]);

    useFrame((state) => {
        if (!linesRef.current) return;
        const t = state.clock.elapsedTime;

        packets.forEach((p, i) => {
            const progress = (t * p.speed * speed + p.offset) % 1.0;
            const curX = THREE.MathUtils.lerp(layerFrom.x, layerTo.x, progress);
            const curY = THREE.MathUtils.lerp(p.y1, p.y2, progress);
            const curZ = THREE.MathUtils.lerp(p.z1, p.z2, progress);

            dummy.position.set(curX, curY, curZ);
            dummy.scale.set(2.0, 0.05, 0.05);
            dummy.lookAt(layerTo.x, p.y2, p.z2);
            dummy.updateMatrix();
            linesRef.current!.setMatrixAt(i, dummy.matrix);
        });
        linesRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={linesRef} args={[undefined, undefined, count]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} blending={THREE.AdditiveBlending} />
        </instancedMesh>
    );
}
