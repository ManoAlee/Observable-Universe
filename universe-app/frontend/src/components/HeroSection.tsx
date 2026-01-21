// src/components/HeroSection.tsx
import React from 'react';
import { styled, keyframes } from '@/design-system/theme';
const HeroContainer = styled('section', {
    position: 'relative',
    width: '100%',
    height: '400px',
    overflow: 'hidden',
    borderRadius: '$lg',
    background: 'black',
    border: '1px solid rgba(255, 255, 255, 0.05)',
});

const scanline = keyframes({
    '0%': { transform: 'translateY(-100%)' },
    '100%': { transform: 'translateY(100%)' },
});

const Overlay = styled('div', {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
    backgroundSize: '100% 2px, 3px 100%',
    zIndex: 5,
});

const Content = styled('div', {
    position: 'absolute',
    top: '50%',
    left: '$lg',
    transform: 'translateY(-50%)',
    zIndex: 10,
    maxWidth: '500px',
    padding: '$md',
    background: 'rgba(5, 5, 5, 0.5)',
    backdropFilter: 'blur(5px)',
    borderRadius: '$md',
    border: '1px solid rgba(255, 255, 255, 0.1)',
});

const Title = styled('h1', {
    fontSize: '$3xl',
    color: 'white',
    marginBottom: '$sm',
    fontFamily: '$heading',
});

const Subtitle = styled('p', {
    fontSize: '$md',
    color: '$muted',
});

import { WebGPUCanvas, WebGPUCanvasHandle } from './WebGPUCanvas';

interface Props {
    modality: string;
}

export const HeroSection = React.forwardRef<WebGPUCanvasHandle, Props>(({ modality }, ref) => (
    <HeroContainer>
        <WebGPUCanvas ref={ref} modality={modality} />
        <Overlay />
    </HeroContainer>
));
