// src/components/DashboardGrid.tsx
import React from 'react';
import { styled } from '@/design-system/theme';

const Grid = styled('div', {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '$lg',
    padding: '$lg 0',
});

const Card = styled('div', {
    padding: '$lg',
    background: '$surface',
    borderRadius: '$lg',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'transform 0.2s',
    '&:hover': {
        transform: 'translateY(-4px)',
        border: '1px solid rgba(210, 100%, 55%, 0.3)',
    },
});

const CardTitle = styled('h3', {
    fontSize: '$md',
    color: '$muted',
    marginBottom: '$sm',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
});

const CardValue = styled('div', {
    fontSize: '$3xl',
    fontWeight: 'bold',
    color: '$text',
});

export const DashboardGrid: React.FC = () => (
    <Grid>
        <Card>
            <CardTitle>System Load</CardTitle>
            <CardValue>12.4%</CardValue>
        </Card>
        <Card>
            <CardTitle>Network Latency</CardTitle>
            <CardValue>18ms</CardValue>
        </Card>
        <Card>
            <CardTitle>Security Level</CardTitle>
            <CardValue>ALPHA</CardValue>
        </Card>
        <Card>
            <CardTitle>Quantum Stability</CardTitle>
            <CardValue>99.98%</CardValue>
        </Card>
    </Grid>
);
