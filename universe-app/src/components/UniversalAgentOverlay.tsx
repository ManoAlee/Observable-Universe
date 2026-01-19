import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function UniversalAgentOverlay({ observer }: { observer: THREE.Vector2 }) {
    const agentsRef = useRef<THREE.InstancedMesh>(null);
    const count = 40;

    const agents = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            pos: new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 20),
            vel: new THREE.Vector3(),
            speed: 0.05 + Math.random() * 0.1
        }));
    }, []);

    useFrame((state) => {
        if (!agentsRef.current) return;
        const t = state.clock.getElapsedTime();
        const dummy = new THREE.Object3D();
        const target = new THREE.Vector3(observer.x * 25, observer.y * 25, 0);

        agents.forEach((agent, i) => {
            // Seek behavior
            const desired = new THREE.Vector3().subVectors(target, agent.pos).normalize().multiplyScalar(agent.speed);
            agent.vel.lerp(desired, 0.02);

            // Perlin-like jitter
            agent.vel.add(new THREE.Vector3(
                Math.sin(t * 2.0 + i) * 0.01,
                Math.cos(t * 1.5 + i) * 0.01,
                Math.sin(t * 3.0 + i) * 0.01
            ));

            agent.pos.add(agent.vel);

            dummy.position.copy(agent.pos);
            dummy.scale.setScalar(0.2 + Math.sin(t * 5.0 + i) * 0.1);
            dummy.lookAt(target);
            dummy.updateMatrix();
            agentsRef.current!.setMatrixAt(i, dummy.matrix);
        });
        agentsRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <group>
            <instancedMesh ref={agentsRef} args={[new THREE.ConeGeometry(0.2, 0.8, 3), new THREE.MeshBasicMaterial({ color: "#00ffff", transparent: true, opacity: 0.8 }), count]} />
            <NeuralLinks agents={agents} />
        </group>
    );
}

function NeuralLinks({ agents }: { agents: any[] }) {
    const linesRef = useRef<THREE.LineSegments>(null);
    const geometry = useMemo(() => new THREE.BufferGeometry(), []);

    useFrame(() => {
        if (linesRef.current) {
            const linePositions = [];
            for (let i = 0; i < agents.length; i++) {
                for (let j = i + 1; j < agents.length; j++) {
                    const dist = agents[i].pos.distanceTo(agents[j].pos);
                    if (dist < 8) {
                        linePositions.push(agents[i].pos.x, agents[i].pos.y, agents[i].pos.z);
                        linePositions.push(agents[j].pos.x, agents[j].pos.y, agents[j].pos.z);
                    }
                }
            }
            linesRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        }
    });

    return (
        <lineSegments ref={linesRef}>
            <bufferGeometry />
            <lineBasicMaterial color="#00ffff" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </lineSegments>
    );
}

