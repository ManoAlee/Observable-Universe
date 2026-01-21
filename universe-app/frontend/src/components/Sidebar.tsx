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

const SidebarItem = styled('div', {
    padding: '$sm $md',
    borderRadius: '$md',
    color: '$text',
    fontSize: '$sm',
    cursor: 'pointer',
    transition: 'background 0.2s',
    '&:hover': {
        background: 'rgba(255, 255, 255, 0.05)',
    },
    variants: {
        active: {
            true: {
                background: 'rgba(210, 100%, 55%, 0.1)',
                color: '$primary',
            },
        },
    },
});

export const Sidebar: React.FC = () => (
    <StyledSidebar>
        <SidebarItem active>Operational Overview</SidebarItem>
        <SidebarItem>User Management</SidebarItem>
        <SidebarItem>System Logs</SidebarItem>
        <SidebarItem>Quantum Clusters</SidebarItem>
        <SidebarItem>Security Protocols</SidebarItem>
    </StyledSidebar>
);
