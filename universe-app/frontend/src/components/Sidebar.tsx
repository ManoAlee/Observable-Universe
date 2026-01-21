// src/components/Sidebar.tsx
import React from 'react';
import { styled } from '@/design-system/theme';

const StyledSidebar = styled('aside', {
    width: '260px',
    height: 'calc(100vh - 64px)',
    padding: '$lg',
    background: '$surface',
    borderRight: '1px solid rgba(255, 255, 255, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '$sm',
});

const SectionTitle = styled('div', {
    fontSize: '$xs',
    color: '$muted',
    marginTop: '$lg',
    marginBottom: '$sm',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
});

const SidebarItem = styled('div', {
    padding: '$sm $md',
    borderRadius: '$md',
    color: '$text',
    fontSize: '$sm',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.05)',
    },
    variants: {
        active: {
            true: {
                background: 'rgba(210, 100%, 55%, 0.1)',
                color: '$primary',
                fontWeight: 'bold',
            },
        },
    },
});

interface Props {
    modality: string;
    setModality: (m: string) => void;
}

export const Sidebar: React.FC<Props> = ({ modality, setModality }) => (
    <StyledSidebar>
        <SectionTitle>Realities</SectionTitle>
        <SidebarItem
            active={modality === 'command'}
            onClick={() => setModality('command')}
        >
            Command Center
        </SidebarItem>
        <SidebarItem
            active={modality === 'transcendental'}
            onClick={() => setModality('transcendental')}
        >
            Transcendental Entropy
        </SidebarItem>

        <SectionTitle>Systems</SectionTitle>
        <SidebarItem>User Management</SidebarItem>
        <SidebarItem>System Logs</SidebarItem>
        <SidebarItem>Quantum Clusters</SidebarItem>
        <SidebarItem>Security Protocols</SidebarItem>
    </StyledSidebar>
);
