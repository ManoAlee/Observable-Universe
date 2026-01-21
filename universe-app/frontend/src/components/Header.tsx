// src/components/Header.tsx
import React from 'react';
import { styled } from '@/design-system/theme';

const StyledHeader = styled('header', {
    position: 'sticky',
    top: 0,
    width: '100%',
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 $lg',
    background: 'rgba(5, 5, 5, 0.7)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    zIndex: 100,
});

const Logo = styled('div', {
    fontSize: '$xl',
    fontWeight: 'bold',
    color: '$primary',
    letterSpacing: '-0.02em',
});

const Nav = styled('nav', {
    marginLeft: 'auto',
    display: 'flex',
    gap: '$md',
});

const NavLink = styled('a', {
    color: '$text',
    textDecoration: 'none',
    fontSize: '$sm',
    fontWeight: '500',
    opacity: 0.8,
    transition: 'opacity 0.2s',
    '&:hover': {
        opacity: 1,
    },
});

export const Header: React.FC = () => (
    <StyledHeader>
        <Logo>NEURA●SYNC</Logo>
        <Nav>
            <NavLink href="#">Dashboard</NavLink>
            <NavLink href="#">System</NavLink>
            <NavLink href="#">Network</NavLink>
            <NavLink href="#">Security</NavLink>
        </Nav>
    </StyledHeader>
);
