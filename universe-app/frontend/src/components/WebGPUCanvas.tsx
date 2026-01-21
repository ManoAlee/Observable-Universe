import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface Props {
    modality: string;
}

export interface WebGPUCanvasHandle {
    triggerBurst: () => void;
}

export const WebGPUCanvas = forwardRef<WebGPUCanvasHandle, Props>(({ modality }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const workerRef = useRef<Worker | null>(null);

    useImperativeHandle(ref, () => ({
        triggerBurst: () => {
            if (workerRef.current) {
                workerRef.current.postMessage({ type: 'burst' });
            }
        }
    }));

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

            // Render Quasar Beam
            if (currentModality === 'quasar') {
                const gradient = ctx.createLinearGradient(centerX - 50, 0, centerX + 50, 0);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

                ctx.fillStyle = gradient;
                ctx.shadowBlur = 50;
                ctx.shadowColor = '#fff';
                ctx.fillRect(centerX - 15, 0, 30, canvas.height);
                ctx.shadowBlur = 0;
            }

            const scale = currentModality === 'transcendental' ? 150 : (currentModality === 'quasar' ? 200 : 300);

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

                // Render Hex Data in Null-Pointer Zone
                if (currentModality === 'nullpointer' && p.data) {
                    ctx.font = '8px monospace';
                    ctx.fillStyle = '#ff00ff';
                    ctx.fillText(p.data, x + 5, y);
                }
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
});
