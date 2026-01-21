// src/design-system/theme.ts
import { createStitches } from '@stitches/react';

export const {
  styled,
  css,
  globalCss,
  keyframes,
  getCssText,
  theme,
  createTheme,
  config,
} = createStitches({
  theme: {
    colors: {
      // Primary palette – futuristic teal/indigo gradient
      primary: 'hsl(210, 100%, 55%)',
      primaryHover: 'hsl(210, 100%, 45%)',
      secondary: 'hsl(260, 80%, 60%)',
      background: 'hsl(0, 0%, 5%)', // dark background for premium look
      surface: 'hsl(0, 0%, 10%)',
      text: 'hsl(0, 0%, 95%)',
      muted: 'hsl(0, 0%, 60%)',
    },
    space: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
    },
    radii: {
      none: '0',
      sm: '4px',
      md: '8px',
      lg: '12px',
      round: '9999px',
    },
    fonts: {
      // Google Font – Inter (modern, highly readable)
      body: 'Inter, system-ui, sans-serif',
      heading: '"Outfit", system-ui, sans-serif',
    },
    fontSizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    shadows: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.1)',
      lg: '0 10px 15px rgba(0,0,0,0.15)',
    },
    // Enable container queries (future‑proof)
    media: {
      bp1: '(min-width: 480px)',
      bp2: '(min-width: 768px)',
      bp3: '(min-width: 1024px)',
    },
    utils: {
      // margin shortcuts
      m: (value: string) => ({ margin: value }),
      mt: (value: string) => ({ marginTop: value }),
      mb: (value: string) => ({ marginBottom: value }),
      ml: (value: string) => ({ marginLeft: value }),
      mr: (value: string) => ({ marginRight: value }),
      // padding shortcuts
      p: (value: string) => ({ padding: value }),
      pt: (value: string) => ({ paddingTop: value }),
      pb: (value: string) => ({ paddingBottom: value }),
      pl: (value: string) => ({ paddingLeft: value }),
      pr: (value: string) => ({ paddingRight: value }),
    },
  },
});

export const darkTheme = createTheme('dark', {
  colors: {
    background: 'hsl(0, 0%, 5%)',
    surface: 'hsl(0, 0%, 10%)',
    text: 'hsl(0, 0%, 95%)',
  },
});

export const lightTheme = createTheme('light', {
  colors: {
    background: 'hsl(0, 0%, 98%)',
    surface: 'hsl(0, 0%, 100%)',
    text: 'hsl(0, 0%, 10%)',
  },
});
