// src/app/layout.tsx
import './globals.css'; // optional, can be empty or contain reset
import { ThemeProvider } from '@/design-system/ThemeProvider';

export const metadata = {
    title: 'Future Front‑End',
    description: 'Premium, ultra‑modern web UI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head />
            <body>
                <ThemeProvider>{children}</ThemeProvider>
            </body>
        </html>
    );
}
