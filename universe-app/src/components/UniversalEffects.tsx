import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

export function UniversalEffects() {
    const { camera } = useThree()
    const lastMouse = useRef(new THREE.Vector2())
    const velocity = useRef(new THREE.Vector2())

    useFrame((state) => {
        // 1. Calculate Velocity (Entropy of Observation)
        const currentMouse = state.pointer
        const deltaX = currentMouse.x - lastMouse.current.x
        const deltaY = currentMouse.y - lastMouse.current.y

        velocity.current.x += deltaX * 1.5
        velocity.current.y += deltaY * 1.5
        velocity.current.multiplyScalar(0.9) // Heavy Drag

        // 2. Camera Roll (Z-Axis) - "The Universe Tilts"
        // OrbitControls controls X/Y usually, but Z is often free.
        // This creates a subtle banking effect when moving mouse left/right.
        const targetRoll = -velocity.current.x * 0.5
        camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRoll, 0.1)

        // 3. FOV Breathing - "The Universe Breathes"
        // Slight zoom in/out based on speed
        const speed = velocity.current.length()
        const targetFov = 75 + speed * 10
        // Note: Changing FOV requires projection matrix update, can be expensive if not careful, 
        // but gives a great "Warp Speed" feel on fast moves.
        // camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 0.05)
        // camera.updateProjectionMatrix()

        lastMouse.current.copy(currentMouse)
    })

    return null
}
