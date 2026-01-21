// src/components/LogosTrigger.tsx
'use client';

import React from 'react';
import { styled, keyframes } from '@/design-system/theme';

const pulse = keyframes({
    '0%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0.4)' },
    '70%': { boxShadow: '0 0 0 15px rgba(255, 215, 0, 0)' },
    '100%': { boxShadow: '0 0 0 0 rgba(255, 215, 0, 0)' },
});

const TriggerButton = styled('button', {
    padding: '$md $xl',
    background: 'linear-gradient(45deg, #ffd700, #ff8c00)',
    border: 'none',
    borderRadius: '$full',
    color: 'black',
    fontSize: '$md',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    display: 'flex',
    alignItems: 'center',
    gap: '$sm',
    animation: `${pulse} 2s infinite`,
    zIndex: 10,
    '&:hover': {
        transform: 'scale(1.05) translateY(-2px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
    },
    '&:active': {
        transform: 'scale(0.95)',
    },
});

const Sparkle = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
);

interface Props {
    onTrigger: () => void;
    modality: string;
}

export const LogosTrigger: React.FC<Props> = ({ onTrigger, modality }) => {
    if (modality !== 'quasar') return null;

    return (
        <div style={{ position: 'fixed', bottom: '40px', right: '40px', zIndex: 100 }}>
            <TriggerButton onClick={onTrigger}>
                <Sparkle />
                Injetar Quasar (The Logos)
            </TriggerButton>
        </div>
    );
};
