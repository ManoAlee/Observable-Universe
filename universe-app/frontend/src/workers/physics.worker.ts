// src/workers/physics.worker.ts

interface Particle {
    x: number;
    y: number;
    z: number;
    color: string;
}

let particles: Particle[] = [];
const NUM_PARTICLES = 400;
let modality = 'command';

// Aizawa Attractor Parameters
const a = 0.95;
const b = 0.7;
const c = 0.6;
const d = 3.5;
const e = 0.25;
const f = 0.1;
const dt = 0.01;

const initParticles = () => {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push({
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 0.5,
            color: Math.random() > 0.5 ? 'hsl(210, 100%, 55%)' : 'hsl(260, 80%, 60%)',
        });
    }
};

const updateTranscendental = () => {
    for (const p of particles) {
        // Aizawa Attractor Equations
        const dx = (p.z - b) * p.x - d * p.y;
        const dy = d * p.x + (p.z - b) * p.y;
        const dz = c + a * p.z - (p.z ** 3) / 3 - (p.x ** 2 + p.y ** 2) * (1 + e * p.z) + f * p.z * (p.x ** 3);

        p.x += dx * dt;
        p.y += dy * dt;
        p.z += dz * dt;

        // Scale to visible range
        if (Math.abs(p.x) > 5) p.x *= 0.9;
        if (Math.abs(p.y) > 5) p.y *= 0.9;
        if (Math.abs(p.z) > 5) p.z *= 0.9;
    }
};

const updateCommand = () => {
    for (const p of particles) {
        p.x += (Math.random() - 0.5) * 0.02;
        p.y += (Math.random() - 0.5) * 0.02;
        p.z += (Math.random() - 0.5) * 0.02;

        // Containment
        if (Math.abs(p.x) > 1) p.x *= 0.95;
        if (Math.abs(p.y) > 0.5) p.y *= 0.95;
        if (Math.abs(p.z) > 0.5) p.z *= 0.95;
    }
};

const tick = () => {
    if (modality === 'transcendental') {
        updateTranscendental();
    } else {
        updateCommand();
    }

    self.postMessage({ particles, modality });
    setTimeout(tick, 16);
};

self.onmessage = (e: MessageEvent) => {
    if (e.data.type === 'start') {
        initParticles();
        tick();
    }
    if (e.data.type === 'switch') {
        modality = e.data.value;
    }
};
