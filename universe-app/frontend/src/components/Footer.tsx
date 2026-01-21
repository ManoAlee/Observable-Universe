// src/components/Footer.tsx
import React from 'react';
import { styled } from '@/design-system/theme';

const StyledFooter = styled('footer', {
    width: '100%',
    padding: '$xl $lg',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '$xs',
    color: '$muted',
});

export const Footer: React.FC = () => (
    <StyledFooter>
        <div>© 2026 NEURASYNC QUANTUM SYSTEMS</div>
        <div>STABILITY STATUS: NOMINAL</div>
    </StyledFooter>
);
