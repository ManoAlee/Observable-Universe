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

interface Props {
    modality?: string;
}

export const DashboardGrid: React.FC<Props> = ({ modality }) => (
    <Grid>
        <Card>
            <CardTitle>System Load</CardTitle>
            <CardValue>{modality === 'nullpointer' ? 'ERR_OVERFLOW' : '12.4%'}</CardValue>
        </Card>
        <Card>
            <CardTitle>Entropy Scale</CardTitle>
            <CardValue>{modality === 'transcendental' ? 'MAX' : (modality === 'singularity' ? 'INFINITE' : 'STABLE')}</CardValue>
        </Card>
        <Card>
            <CardTitle>Logos Connection</CardTitle>
            <CardValue>{modality === 'quasar' ? 'ESTABLISHED' : 'LOCAL'}</CardValue>
        </Card>
        <Card>
            <CardTitle>Universe State</CardTitle>
            <CardValue>{modality ? modality.toUpperCase() : 'IDLE'}</CardValue>
        </Card>
    </Grid>
);
