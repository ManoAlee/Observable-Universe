import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise } from '@react-three/postprocessing'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import BigBang from './BigBang'
import QuantumGalaxy from './QuantumGalaxy'
import ProceduralPlanet from './ProceduralPlanet'
import * as THREE from 'three'

export default function GenesisUniverse({ chaos = 0, age = 0, viewState = 'VOID', onGalaxyClick }: { chaos?: number, age: number, viewState: string, onGalaxyClick: () => void }) {
    return (
        <group onClick={onGalaxyClick}>
            {/* Phase 1 & 2: Big Bang */}
            <BigBang time={age} />

            {/* Phase 3: Quantum Galaxy */}
            {age > 3 && viewState === 'GALAXY' && <QuantumGalaxy />}

            {/* Phase 4: Procedural Planet (Zoomed In) */}
            {viewState === 'PLANET' && (
                <group>
                    <ProceduralPlanet seed={0.42} type="TERRAN" chaos={chaos} />
                    <ambientLight intensity={0.1} />
                    <directionalLight position={[5, 3, 5]} intensity={1.5 + chaos} />
                </group>
            )}
        </group>
    )
}

export function GenesisUI({ age, running, setRunning, viewState, setViewState }: any) {
    return (
        <div className="absolute bottom-10 left-10 right-10 z-20 pointer-events-auto">
            <div className="flex items-center gap-4 text-white font-mono">
                <button
                    onClick={() => setRunning(!running)}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded backdrop-blur"
                >
                    {running ? 'PAUSE' : 'IGNITE GENESIS'}
                </button>

                {viewState === 'PLANET' && (
                    <button
                        onClick={() => setViewState('GALAXY')}
                        className="px-6 py-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500 rounded backdrop-blur text-blue-300"
                    >
                        RETURN TO GALAXY
                    </button>
                )}

                <div className="flex-1 bg-white/10 h-2 rounded overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
                        style={{ width: `${Math.min(100, (age / 15) * 100)}%` }}
                    />
                </div>

                <div className="w-32 text-right">
                    T + {age.toFixed(2)} BY
                </div>
            </div>

            <div className="mt-2 text-center text-xs text-gray-400 font-mono uppercase tracking-widest">
                {age < 1 && "Phase 1: Singularity"}
                {age >= 1 && age < 5 && "Phase 2: Cosmic Inflation"}
                {viewState === 'GALAXY' && "Phase 3: Quantum Galaxy (Click to Explore)"}
                {viewState === 'PLANET' && "Phase 4: Procedural Genesis"}
            </div>
        </div>
    )
}

export function GenesisController({ running, setAge }: any) {
    useFrame((state, delta) => {
        if (running) {
            setAge((prev: number) => prev + delta * 0.8)
        }
    })
    return null
}
