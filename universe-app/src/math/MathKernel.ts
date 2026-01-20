import * as THREE from 'three'

/**
 * MATH KERNEL: The source of "Truth" for the Universe.
 * Contains pure mathematical functions to drive physics and visuals.
 */

// --- CHAOS THEORY ---

export const lorenzAttractor = (pos: THREE.Vector3, sigma = 10, rho = 28, beta = 8 / 3, dt = 0.01): THREE.Vector3 => {
    const dx = sigma * (pos.y - pos.x)
    const dy = pos.x * (rho - pos.z) - pos.y
    const dz = pos.x * pos.y - beta * pos.z

    return new THREE.Vector3(
        pos.x + dx * dt,
        pos.y + dy * dt,
        pos.z + dz * dt
    )
}

// --- QUANTUM MECHANICS ---

/**
 * simplified Schrödinger wave packet probability density
 */
export const waveFunction = (position: THREE.Vector3, time: number, frequency: number = 1.0): number => {
    const r = position.length()
    // Radial decay * Oscillating component
    const psi = Math.exp(-r * 0.1) * Math.cos(r * frequency - time)
    return psi * psi // Probability density (|ψ|²)
}

// --- SACRED GEOMETRY ---

/**
 * Generates points on a sphere using the Fibonacci lattice algorithm.
 * Represents perfect distribution "Truth".
 */
export const fibonacciSphere = (samples: number = 1000, radius: number = 1): Float32Array => {
    const points = new Float32Array(samples * 3)
    const phi = Math.PI * (3 - Math.sqrt(5)) // Golden Angle

    for (let i = 0; i < samples; i++) {
        const y = 1 - (i / (samples - 1)) * 2 // y goes from 1 to -1
        const r = Math.sqrt(1 - y * y) // Radius at y
        const theta = phi * i

        const x = Math.cos(theta) * r
        const z = Math.sin(theta) * r

        points[i * 3] = x * radius
        points[i * 3 + 1] = y * radius
        points[i * 3 + 2] = z * radius
    }
    return points
}

// --- AUTOMATA ---

/**
 * 1D Cellular Automata Step (Wolfram Rules)
 * rule 30 is chaotic, rule 90 is fractal (Sierpinski)
 */
export const stepAutomata1D = (cells: number[], rule: number = 30): number[] => {
    const newCells = new Array(cells.length).fill(0)
    const len = cells.length

    for (let i = 0; i < len; i++) {
        const left = cells[(i - 1 + len) % len]
        const center = cells[i]
        const right = cells[(i + 1) % len]

        // Construct 3-bit integer from neighbors
        const pattern = (left << 2) | (center << 1) | right

        // Check if bit is set in rule
        newCells[i] = (rule >> pattern) & 1
    }
    return newCells
}

// --- INTENTIONALITY & LIFE CALCULUS ---

/**
 * INTENTIONAL GRAVITY:
 * Concepts with similar "Intent" (type/id) attract each other.
 * Unlike physical gravity, this force ignores mass and obeys "Meaning".
 */
export const intentionalGravity = (
    posA: THREE.Vector3,
    posB: THREE.Vector3,
    intentA: number,
    intentB: number,
    strength: number = 0.5
): THREE.Vector3 => {
    const diff = new THREE.Vector3().subVectors(posB, posA)
    const dist = diff.length()

    // Similarity check: If concepts are close in value, they attract strongly
    const similarity = 1.0 - Math.min(1.0, Math.abs(intentA - intentB))

    // Force is stronger when similar, but falls off with distance (inverse square)
    const forceMagnitude = (similarity * strength) / (dist * dist + 0.1)

    return diff.normalize().multiplyScalar(forceMagnitude)
}

/**
 * LIFE CALCULUS (1 + 1 = 1)
 * Fusion logic. If two entities are close enough and compatible, they merge.
 * Returns true if fusion should occur.
 */
export const checkFusion = (posA: THREE.Vector3, posB: THREE.Vector3, threshold: number = 2.0): boolean => {
    return posA.distanceTo(posB) < threshold
}
