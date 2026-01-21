// src/workers/physics.worker.ts

interface Particle {
    x: number;
    y: number;
    z: number;
    color: string;
}

let particles: Particle[] = [];
const NUM_PARTICLES = 800;
let modality = 'command';

// Aizawa Attractor Parameters
const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1, dt = 0.01;

const initParticles = () => {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 1 + Math.random() * 5;
        particles.push({
            x: Math.cos(angle) * radius,
            y: Math.sin(angle) * radius,
            z: (Math.random() - 0.5) * 4,
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
        const force = 0.015 / (distSq + 0.1);
        p.x -= (p.x / dist) * force;
        p.y -= (p.y / dist) * force;
        p.z -= (p.z / dist) * force;
        const rotSpeed = 0.04 / (dist + 0.5);
        p.x += -p.y * rotSpeed;
        p.y += p.x * rotSpeed;
        const hue = Math.max(0, 40 - dist * 10);
        p.color = `hsl(${hue}, 100%, ${Math.max(10, 100 - dist * 15)}%)`;
        if (dist < 0.05) {
            const angle = Math.random() * Math.PI * 2;
            const r = 4 + Math.random() * 2;
            p.x = Math.cos(angle) * r; p.y = Math.sin(angle) * r; p.z = (Math.random() - 0.5) * 2;
        }
    }
};

const updateCosmicWeb = () => {
    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // Filament nodes: connect particles in strings
        const targetIdx = (i + 1) % particles.length;
        const target = particles[targetIdx];
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dz = target.z - p.z;
        p.x += dx * 0.01;
        p.y += dy * 0.01;
        p.z += dz * 0.01;

        // Add cosmic expansion drift
        p.x *= 1.001; p.y *= 1.001; p.z *= 1.001;
        p.color = 'rgba(68, 136, 255, 0.5)';

        if (Math.abs(p.x) > 10) p.x *= -0.1;
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
    }
};

const tick = () => {
    if (modality === 'transcendental') updateTranscendental();
    else if (modality === 'singularity') updateSingularity();
    else if (modality === 'cosmicweb') updateCosmicWeb();
    else updateCommand();

    self.postMessage({ particles, modality });
    setTimeout(tick, 16);
};

self.onmessage = (e) => {
    if (e.data.type === 'start') { initParticles(); tick(); }
    if (e.data.type === 'switch') modality = e.data.value;
};
