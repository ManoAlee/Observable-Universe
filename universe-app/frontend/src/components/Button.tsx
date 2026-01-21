// src/components/Button.tsx
import React from 'react';
import { styled } from '@/design-system/theme';

const StyledButton = styled('button', {
    // Base styles
    all: 'unset',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '$sm $md',
    borderRadius: '$md',
    fontFamily: '$body',
    fontSize: '$md',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    // Theme-aware colors
    backgroundColor: '$primary',
    color: '$text',
    '&:hover': {
        backgroundColor: '$primaryHover',
    },
    '&:active': {
        transform: 'scale(0.98)',
    },
    '&:focus-visible': {
        outline: '2px solid $secondary',
        outlineOffset: '2px',
    },
});

type ButtonProps = React.ComponentPropsWithoutRef<'button'> & {
    children: React.ReactNode;
};

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
    return <StyledButton {...props}>{children}</StyledButton>;
};
