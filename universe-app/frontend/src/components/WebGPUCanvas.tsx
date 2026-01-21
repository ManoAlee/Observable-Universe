// src/components/WebGPUCanvas.tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { theme } from '@/design-system/theme';

interface Props {
    modality: string;
}

export const WebGPUCanvas: React.FC<Props> = ({ modality }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const workerRef = useRef<Worker | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Load worker
        const worker = new Worker(new URL('../workers/physics.worker.ts', import.meta.url));
        workerRef.current = worker;
        worker.postMessage({ type: 'start' });

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = canvas.clientWidth * window.devicePixelRatio;
            canvas.height = canvas.clientHeight * window.devicePixelRatio;
        };
        window.addEventListener('resize', resize);
        resize();

        worker.onmessage = (e) => {
            const { particles, modality: currentModality } = e.data;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const scale = currentModality === 'transcendental' ? 150 : 300;

            particles.forEach((p: any) => {
                // Perspective projection
                const zScale = 1 / (p.z + 4);
                const x = centerX + p.x * scale * zScale;
                const y = centerY + p.y * scale * zScale;
                const size = Math.max(1, 4 * zScale);

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;

                // Add glow for transcendental
                if (currentModality === 'transcendental') {
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = p.color;
                } else {
                    ctx.shadowBlur = 0;
                }

                ctx.fill();
            });
        };

        return () => {
            worker.terminate();
            window.removeEventListener('resize', resize);
        };
    }, []);

    useEffect(() => {
        if (workerRef.current) {
            workerRef.current.postMessage({ type: 'switch', value: modality });
        }
    }, [modality]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: '100%',
                height: '100%',
                display: 'block',
                background: 'transparent',
            }}
        />
    );
};
