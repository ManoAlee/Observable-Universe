import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { ThemeProvider } from '@/design-system/ThemeProvider';

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(
            <ThemeProvider>
                <Button>Click Me</Button>
            </ThemeProvider>
        );
        expect(screen.getByText('Click Me')).toBeInTheDocument();
    });

    it('calls onClick when clicked', () => {
        const handleClick = jest.fn();
        render(
            <ThemeProvider>
                <Button onClick={handleClick}>Click Me</Button>
            </ThemeProvider>
        );
        fireEvent.click(screen.getByText('Click Me'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });
});
