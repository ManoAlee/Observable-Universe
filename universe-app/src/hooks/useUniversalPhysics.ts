import { useRef, useEffect } from 'react'
import * as THREE from 'three'

export function useUniversalPhysics() {
    const mouse = useRef(new THREE.Vector2(0, 0))
    const velocity = useRef(new THREE.Vector2(0, 0))
    const target = useRef(new THREE.Vector2(0, 0))
    const lastTime = useRef(0)

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            // Normalized -1 to 1
            const x = (e.clientX / window.innerWidth) * 2 - 1
            const y = -(e.clientY / window.innerHeight) * 2 + 1
            target.current.set(x, y)
        }
        window.addEventListener('mousemove', handleMove)
        return () => window.removeEventListener('mousemove', handleMove)
    }, [])

    const update = (time: number) => {
        const dt = Math.min(0.1, time - lastTime.current)
        lastTime.current = time

        // Simple Spring Physics
        const tension = 2.0 // Strength of pull towards mouse
        const friction = 0.9 // Damping (Air resistance)

        const forceX = (target.current.x - mouse.current.x) * tension
        const forceY = (target.current.y - mouse.current.y) * tension

        velocity.current.x += forceX * dt
        velocity.current.y += forceY * dt

        velocity.current.multiplyScalar(friction)

        mouse.current.add(velocity.current.clone().multiplyScalar(dt))

        return {
            position: mouse.current,
            velocity: velocity.current,
            chaos: velocity.current.length() // Speed = Chaos
        }
    }

    return { update }
}
