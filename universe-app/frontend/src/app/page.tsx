// src/app/page.tsx
'use client';

import React from 'react';
import { styled } from '@/design-system/theme';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HeroSection } from '@/components/HeroSection';
import { DashboardGrid } from '@/components/DashboardGrid';
import { Footer } from '@/components/Footer';

const PageContainer = styled('div', {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    background: '$background',
});

const LayoutBody = styled('div', {
    display: 'flex',
    flex: 1,
});

const ContentArea = styled('main', {
    flex: 1,
    padding: '$lg',
    display: 'flex',
    flexDirection: 'column',
    gap: '$lg',
});

export default function HomePage() {
    return (
        <PageContainer>
            <Header />
            <LayoutBody>
                <Sidebar />
                <ContentArea>
                    <HeroSection />
                    <DashboardGrid />
                    <Footer />
                </ContentArea>
            </LayoutBody>
        </PageContainer>
    );
}
