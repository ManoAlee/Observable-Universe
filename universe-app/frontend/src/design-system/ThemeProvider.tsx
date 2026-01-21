// src/design-system/ThemeProvider.tsx
import React, { ReactNode, useState, useEffect } from 'react';
import { darkTheme } from '@/design-system/theme';

interface Props {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: Props) => {
    const [isDark, setIsDark] = useState<boolean>(false);

    // Detect system preference on mount
    useEffect(() => {
        const media = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(media.matches);
        const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
        media.addEventListener('change', handler);
        return () => media.removeEventListener('change', handler);
    }, []);

    return (
        <div className={isDark ? darkTheme.className : ''}>
            {children}
        </div>
    );
};
