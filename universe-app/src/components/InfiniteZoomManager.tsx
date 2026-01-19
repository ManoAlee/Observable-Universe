import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface InfiniteZoomManagerProps {
    active: boolean;
    onComplete: () => void;
}

export default function InfiniteZoomManager({ active, onComplete }: InfiniteZoomManagerProps) {
    const { camera } = useThree();
    const initialZ = useRef(100);
    const targetZ = useRef(0.1);
    const progress = useRef(0);

    useFrame((state, delta) => {
        if (!active) {
            progress.current = 0;
            return;
        }

        progress.current += delta * 0.5; // Slow transition
        const ease = THREE.MathUtils.smoothstep(progress.current, 0, 1);

        // Smoothly scale Z position to "zoom in" infinitely
        camera.position.z = THREE.MathUtils.lerp(initialZ.current, targetZ.current, ease);

        if (progress.current >= 1) {
            onComplete();
        }
    });

    return null;
}
