import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function DataStream() {
    const count = 400;
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }).map(() => ({
            speed: 1 + Math.random() * 3,
            position: new THREE.Vector3(
                (Math.random() - 0.5) * 5,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 5
            ),
            phase: Math.random() * Math.PI * 2,
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.getElapsedTime();

        particles.forEach((p, i) => {
            // Periodic movement along Y axis (jets)
            const y = ((p.position.y + t * p.speed) % 100) - 50;
            const absY = Math.abs(y);

            // Pinching effect near center (Singularity)
            const scale = Math.max(0, (50 - absY) / 50) * 1.5;
            const spread = absY * 0.1;

            // Top jet (y > 0) or Bottom jet (y < 0)
            const direction = y > 0 ? 1 : -1;

            dummy.position.set(
                p.position.x * spread,
                y,
                p.position.z * spread
            );

            dummy.scale.set(scale, scale * 5, scale);
            dummy.rotation.set(0, t * p.speed, 0);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
            <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={0.4}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
            />
        </instancedMesh>
    );
}
