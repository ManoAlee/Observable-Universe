import { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { lorenzAttractor } from '../math/MathKernel'

export function useUniverseMath() {
    // Shared state references could go here if we needed global synchronization
    // For now, we provide utility generators that components can use

    const chaoticOrbit = (initialPos: THREE.Vector3, speed: number = 1.0) => {
        // We use a ref to hold the current position so it persists across frames
        const pos = useRef(initialPos.clone())

        useFrame((state, delta) => {
            // Evolve position using Lorenz Attractor logic
            // Dynamic time step based on speed
            const dt = delta * speed
            pos.current = lorenzAttractor(pos.current, 10, 28, 8 / 3, dt)
        })

        return pos
    }

    return {
        chaoticOrbit
    }
}
