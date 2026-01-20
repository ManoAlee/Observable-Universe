import { useState, useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

export interface IntentState {
    velocity: number; // 0 to 1 (Normalized mouse speed)
    gazeTarget: string | null; // ID of the object being looked at
    dwellTime: number; // How long user has been looking at target
    isAggressive: boolean; // True if velocity > threshold
    isFocused: boolean; // True if dwellTime > threshold
}

export function useNeuralIntent() {
    const [intent, setIntent] = useState<IntentState>({
        velocity: 0,
        gazeTarget: null,
        dwellTime: 0,
        isAggressive: false,
        isFocused: false
    });

    const lastMouse = useRef(new THREE.Vector2(0, 0));
    const lastTime = useRef(0);
    const dwellTimer = useRef(0);
    const lastTarget = useRef<string | null>(null);

    // Update function to be called inside useFrame or event listener
    const updateIntent = useCallback((mouse: THREE.Vector2, currentTarget: string | null, delta: number) => {
        // 1. Calculate Velocity
        const dist = mouse.distanceTo(lastMouse.current);
        const speed = dist / delta; // pixels per second (ish)
        const normalizedVel = Math.min(1.0, speed * 2.0); // Sensitive

        // 2. State Logic
        const isAggressive = normalizedVel > 0.5;

        // 3. Dwell/Gaze Logic
        if (currentTarget === lastTarget.current && currentTarget !== null) {
            dwellTimer.current += delta;
        } else {
            dwellTimer.current = 0;
            lastTarget.current = currentTarget;
        }

        const isFocused = dwellTimer.current > 1.0; // 1 second focus

        // 4. Update Refs
        lastMouse.current.copy(mouse);

        // 5. Update State (Throttled ideally, but for now simple)
        // We set state only if meaningful change to avoid re-renders? 
        // For now, let's update every frame via ref/callback pattern or just return the visual logic.
        // Actually, returning a ref is better for perforamnce loops.

        return {
            velocity: normalizedVel,
            isAggressive,
            isFocused,
            dwellTime: dwellTimer.current
        };
    }, []);

    return { updateIntent, intent };
}
