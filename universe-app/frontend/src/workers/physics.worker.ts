// src/workers/physics.worker.ts

interface Particle {
    x: number;
    y: number;
    z: number;
    color: string;
}

let particles: Particle[] = [];
const NUM_PARTICLES = 600;
let modality = 'command';

// Aizawa Attractor Parameters
const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1, dt = 0.01;

const initParticles = () => {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 4;
        particles.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: (Math.random() - 0.5) * 2,
            color: 'hsl(210, 100%, 55%)',
        });
    }
};

const updateTranscendental = () => {
    for (const p of particles) {
        const dx = (p.z - b) * p.x - d * p.y;
        const dy = d * p.x + (p.z - b) * p.y;
        const dz = c + a * p.z - (p.z ** 3) / 3 - (p.x ** 2 + p.y ** 2) * (1 + e * p.z) + f * p.z * (p.x ** 3);
        p.x += dx * dt;
        p.y += dy * dt;
        p.z += dz * dt;
        p.color = 'hsl(260, 80%, 60%)';
    }
};

const updateSingularity = () => {
    for (const p of particles) {
        const distSq = p.x * p.x + p.y * p.y + p.z * p.z;
        const dist = Math.sqrt(distSq);

        // Gravitational center at (0,0,0)
        const force = 0.01 / (distSq + 0.1);
        p.x -= (p.x / dist) * force;
        p.y -= (p.y / dist) * force;
        p.z -= (p.z / dist) * force;

        // Small tangential component for rotation (accretion disk effect)
        const rotSpeed = 0.03 / (dist + 0.5);
        const tx = -p.y * rotSpeed;
        const ty = p.x * rotSpeed;
        p.x += tx;
        p.y += ty;

        // Pulse color based on proximity to event horizon
        const hue = 0 + (dist * 20); // Event horizon red (0) to white/blue
        p.color = `hsl(${hue}, 100%, ${Math.max(20, 100 - dist * 10)}%)`;

        // Respawn if swallowed
        if (dist < 0.1) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 3 + Math.random() * 2;
            p.x = Math.cos(angle) * radius;
            p.y = Math.sin(angle) * radius;
            p.z = (Math.random() - 0.5);
        }
    }
};

const updateCommand = () => {
    for (const p of particles) {
        p.x += (Math.random() - 0.5) * 0.02;
        p.y += (Math.random() - 0.5) * 0.02;
        p.z += (Math.random() - 0.5) * 0.02;
        p.color = 'hsl(210, 100%, 55%)';
        if (Math.abs(p.x) > 1) p.x *= 0.95;
        if (Math.abs(p.y) > 0.5) p.y *= 0.95;
        if (Math.abs(p.z) > 0.5) p.z *= 0.95;
    }
};

const tick = () => {
    if (modality === 'transcendental') updateTranscendental();
    else if (modality === 'singularity') updateSingularity();
    else updateCommand();

    self.postMessage({ particles, modality });
    setTimeout(tick, 16);
};

self.onmessage = (e) => {
    if (e.data.type === 'start') { initParticles(); tick(); }
    if (e.data.type === 'switch') modality = e.data.value;
};
