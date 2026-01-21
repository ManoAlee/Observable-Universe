// src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { styled } from '@/design-system/theme';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { HeroSection } from '@/components/HeroSection';
import { DashboardGrid } from '@/components/DashboardGrid';
import { LogosTrigger } from '@/components/LogosTrigger';
import { WebGPUCanvasHandle } from '@/components/WebGPUCanvas';

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

import { Footer } from '@/components/Footer';

export default function HomePage() {
    const [modality, setModality] = useState('command');
    const canvasRef = React.useRef<WebGPUCanvasHandle>(null);

    const onTrigger = () => {
        if (canvasRef.current) {
            canvasRef.current.triggerBurst();
        }
    };

    return (
        <PageContainer>
            <Header />
            <LayoutBody>
                <Sidebar modality={modality} setModality={setModality} />
                <ContentArea>
                    <HeroSection ref={canvasRef} modality={modality} />
                    <DashboardGrid modality={modality} />
                    <Footer />
                </ContentArea>
            </LayoutBody>
            <LogosTrigger onTrigger={onTrigger} modality={modality} />
        </PageContainer>
    );
}
