import React, { createContext, useContext, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Mutable Ref Context for High Performance (avoid React Render Cycle for physics)
interface IntentContextValue {
    velocity: React.MutableRefObject<number>;
    isAggressive: React.MutableRefObject<boolean>;
}

const NeuralIntentContext = createContext<IntentContextValue | null>(null);

export function NeuralIntentProvider({ children }: { children: React.ReactNode }) {
    const velocity = useRef(0);
    const isAggressive = useRef(false);

    return (
        <NeuralIntentContext.Provider value={{ velocity, isAggressive }}>
            {children}
        </NeuralIntentContext.Provider>
    );
}

// Helper to update refs from R3F loop (Must be placed INSIDE <Canvas>)
export function IntentUpdater() {
    const context = useContext(NeuralIntentContext);
    const lastMouse = useRef(new THREE.Vector2(0, 0));

    useFrame((state) => {
        if (!context) return;
        const { velocity, isAggressive } = context;

        const dist = state.mouse.distanceTo(lastMouse.current);
        // Approximation of speed
        velocity.current = THREE.MathUtils.lerp(velocity.current, dist * 50, 0.1);
        isAggressive.current = velocity.current > 0.5;
        lastMouse.current.copy(state.mouse);
    });
    return null;
}

export const useIntent = () => {
    const context = useContext(NeuralIntentContext);
    if (!context) throw new Error("useIntent must be used within a NeuralIntentProvider");
    return context;
};
