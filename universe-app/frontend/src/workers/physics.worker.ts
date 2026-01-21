// src/workers/physics.worker.ts

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
}

const particles: Particle[] = [];
const NUM_PARTICLES = 100;

// Initialize particles
for (let i = 0; i < NUM_PARTICLES; i++) {
    particles.push({
        x: Math.random() * 800,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
    });
}

const update = () => {
    for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > 800) p.vx *= -1;
        if (p.y < 0 || p.y > 400) p.vy *= -1;
    }

    // Send back updated positions
    self.postMessage(particles);
    setTimeout(update, 16); // ~60fps
};

self.onmessage = (e) => {
    if (e.data === 'start') {
        update();
    }
};
