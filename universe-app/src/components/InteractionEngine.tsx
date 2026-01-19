import React, { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { UniverseDecoderService } from '../services/universeDecoder';

interface InteractionEngineProps {
    onInteraction: (data: any) => void;
    isDecoding: boolean;
}

export default function InteractionEngine({ onInteraction, isDecoding }: InteractionEngineProps) {
    const { raycaster, mouse, camera, scene } = useThree();
    const lastInteractTime = useRef(0);

    useFrame((state) => {
        if (!isDecoding) return;

        const now = state.clock.getElapsedTime();
        if (now - lastInteractTime.current < 0.1) return; // Throttle

        raycaster.setFromCamera(mouse, camera);
        // We only care about named objects or specifically tagged objects
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            const object = intersects[0].object;
            // Emit a "decodable" signal if we hit something interesting
            if (object.name || (object as any).userData?.decodable) {
                onInteraction({
                    type: 'OBJECT_INTERACTION',
                    name: object.name || 'ANOMALY',
                    distance: intersects[0].distance,
                    timestamp: Date.now()
                });
                lastInteractTime.current = now;
            }
        }
    });

    return null;
}
