// src/components/HeroSection.tsx
import React from 'react';
import { styled } from '@/design-system/theme';
import { WebGPUCanvas } from './WebGPUCanvas';

const HeroContainer = styled('section', {
    position: 'relative',
    width: '100%',
    height: '400px',
    overflow: 'hidden',
    borderRadius: '$lg',
    background: 'black',
});

const Content = styled('div', {
    position: 'absolute',
    top: '50%',
    left: '$lg',
    transform: 'translateY(-50%)',
    zIndex: 10,
    maxWidth: '500px',
});

const Title = styled('h1', {
    fontSize: '$4xl',
    color: 'white',
    marginBottom: '$md',
});

const Subtitle = styled('p', {
    fontSize: '$lg',
    color: '$muted',
    marginBottom: '$xl',
});

export const HeroSection: React.FC = () => (
    <HeroContainer>
        <WebGPUCanvas />
        <Content>
            <Title>Neural Command Interface</Title>
            <Subtitle>
                Monitoring the quantum state of decentralized networks with extreme performance and real-time observability.
            </Subtitle>
        </Content>
    </HeroContainer>
);
