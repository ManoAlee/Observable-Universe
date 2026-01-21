// src/app/page.tsx
'use client';

import React, { useState } from 'react';
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
    overflow: 'hidden',
});

export default function HomePage() {
    const [modality, setModality] = useState('command');

    return (
        <PageContainer>
            <Header />
            <LayoutBody>
                <Sidebar modality={modality} setModality={setModality} />
                <ContentArea>
                    <HeroSection modality={modality} />
                    <DashboardGrid modality={modality} />
                    <Footer />
                </ContentArea>
            </LayoutBody>
        </PageContainer>
    );
}
