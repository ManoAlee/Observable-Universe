// src/workers/physics.worker.ts

interface Particle {
    x: number;
    y: number;
    z: number;
    color: string;
}

let particles: Particle[] = [];
const NUM_PARTICLES = 1000;
let modality = 'command';
let burstTime = 0;

const hexChars = '0123456789ABCDEF';
const generateHex = () => '0x' + Array.from({ length: 4 }, () => hexChars[Math.floor(Math.random() * 16)]).join('');

const initParticles = () => {
    particles = [];
    for (let i = 0; i < NUM_PARTICLES; i++) {
        particles.push({
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 5,
            color: 'hsl(210, 100%, 55%)',
        });
    }
};

const updateTranscendental = () => {
    const a = 0.95, b = 0.7, c = 0.6, d = 3.5, e = 0.25, f = 0.1, dt = 0.01;
    for (const p of particles) {
        const dx = (p.z - b) * p.x - d * p.y;
        const dy = d * p.x + (p.z - b) * p.y;
        const dz = c + a * p.z - (p.z ** 3) / 3 - (p.x ** 2 + p.y ** 2) * (1 + e * p.z) + f * p.z * (p.x ** 3);
        p.x += dx * dt; p.y += dy * dt; p.z += dz * dt;
        p.color = 'hsl(260, 80%, 60%)';
    }
};

const updateSingularity = () => {
    for (const p of particles) {
        const distSq = p.x * p.x + p.y * p.y + p.z * p.z;
        const dist = Math.sqrt(distSq);
        const force = 0.02 / (distSq + 0.1);
        p.x -= (p.x / dist) * force; p.y -= (p.y / dist) * force; p.z -= (p.z / dist) * force;
        p.x += -p.y * 0.04; p.y += p.x * 0.04;
        p.color = `hsl(${Math.max(0, 40 - dist * 10)}, 100%, ${Math.max(10, 100 - dist * 15)}%)`;
        if (dist < 0.05) { p.x = (Math.random() - 0.5) * 10; p.y = (Math.random() - 0.5) * 10; }
    }
};

const updateQuasar = () => {
    burstTime += 0.016;
    const isBurst = Math.sin(burstTime * 2) > 0.8;

    for (const p of particles) {
        const distAxis = Math.sqrt(p.x * p.x + p.z * p.z);

        // Attraction to the central vertical beam
        p.x -= (p.x / (distAxis + 0.1)) * 0.02;
        p.z -= (p.z / (distAxis + 0.1)) * 0.02;

        // Vertical flow
        p.y += 0.05;
        if (p.y > 5) {
            p.y = -5;
            p.x = (Math.random() - 0.5) * 0.5;
            p.z = (Math.random() - 0.5) * 0.5;
        }

        // Ex-Nihilo Energy Bursts
        if (isBurst && Math.random() > 0.9) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5;
            p.x += Math.cos(angle) * speed;
            p.z += Math.sin(angle) * speed;
            p.color = '#ffffff'; // Flash white
        } else {
            p.color = 'hsl(45, 100%, 60%)'; // Electric Gold
            if (Math.random() > 0.95) p.color = 'hsl(260, 100%, 70%)'; // Indigo sparks
        }
    }
};

const updateNullPointer = () => {
    for (const p of particles) {
        if (Math.random() > 0.98) {
            p.x = (Math.random() - 0.5) * 8; p.y = (Math.random() - 0.5) * 8; p.z = (Math.random() - 0.5) * 4;
        } else {
            p.x += (Math.random() - 0.5) * 0.1; p.y += (Math.random() - 0.5) * 0.1;
        }
        p.color = Math.random() > 0.9 ? '#ff00ff' : '#000000';
        if (Math.random() > 0.95) p.color = '#ffffff';
        (p as any).data = Math.random() > 0.96 ? generateHex() : null;
    }
};

const updateCommand = () => {
    for (const p of particles) {
        p.x += (Math.random() - 0.5) * 0.02; p.y += (Math.random() - 0.5) * 0.02;
        p.color = 'hsl(210, 100%, 55%)';
        if (Math.abs(p.x) > 1) p.x *= 0.95; if (Math.abs(p.y) > 0.5) p.y *= 0.95;
    }
};

const tick = () => {
    if (modality === 'transcendental') updateTranscendental();
    else if (modality === 'singularity') updateSingularity();
    else if (modality === 'nullpointer') updateNullPointer();
    else if (modality === 'quasar') updateQuasar();
    else updateCommand();

    self.postMessage({ particles, modality });
    setTimeout(tick, 16);
};

self.onmessage = (e) => {
    if (e.data.type === 'start') { initParticles(); tick(); }
    if (e.data.type === 'switch') modality = e.data.value;
    if (e.data.type === 'burst') {
        for (const p of particles) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.0 + Math.random() * 2.0;
            p.x += Math.cos(angle) * speed;
            p.z += Math.sin(angle) * speed;
            p.color = '#ffffff';
        }
    }
};
