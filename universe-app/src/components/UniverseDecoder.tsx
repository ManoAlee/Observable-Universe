import React, { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Float, Text, Billboard, Stars } from '@react-three/drei'
import * as THREE from 'three'
import { UniverseDecoderService, LSSIData } from '../services/universeDecoder'
import StellarNavigation from './StellarNavigation'
import DashboardLabel from './atoms/DashboardLabel'
import DetailPanel from './atoms/DetailPanel'
import SolarActivityGlobe from './molecules/SolarActivityGlobe'
import SeismicEarth from './molecules/SeismicEarth'
import NeoTracker from './molecules/NeoTracker'
import DataLogTerminal from './molecules/DataLogTerminal'

interface UniverseDecoderProps {
    observer: THREE.Vector2
    entropy: number
    isDecoding: boolean
    viewMode?: string
    onNavigate?: (mode: any) => void
    onSetEntropy?: (entropy: number) => void
}

export default function UniverseDecoder({ observer, entropy, isDecoding, viewMode, onNavigate, onSetEntropy }: UniverseDecoderProps) {
    const [realData, setRealData] = useState<LSSIData | null>(null)
    const [lastUpdate, setLastUpdate] = useState<string>('Initializing...')
    const [focusedModule, setFocusedModule] = useState<string | null>(null)

    useEffect(() => {
        const fetchData = async () => {
            const data = await UniverseDecoderService.fetchFullStatus()
            setRealData(data)
            setLastUpdate(new Date().toLocaleTimeString())
        }
        fetchData()
        const interval = setInterval(fetchData, 60000) // Update every minute
        return () => clearInterval(interval)
    }, [])

    // Calculate Risk/Probability from LSSI (0-100)
    // Risk = LSSI / 50 -> 0 to 2.0
    const riskFactor = (realData?.lssi || 0) / 50

    const handleSync = () => {
        if (onSetEntropy && realData) {
            // Inject LSSI-based entropy into the Universe
            // High LSSI = High Chaos
            const injectedEntropy = Math.min(1.0, (realData.lssi / 100))
            onSetEntropy(injectedEntropy)
        }
    }

    return (
        <group>
            {/* Background Atmosphere & Probability Cloud */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <DeepSpaceGrid />
            <ProbabilityCloud risk={riskFactor} />

            {/* 1. SOLAR ACTIVITY MONITOR (NOAA DATA) */}
            <group position={[-25, 10, -10]} onClick={() => setFocusedModule('SOLAR')}>
                <SolarActivityGlobe kp={realData?.solarKp || 0} />
                <DashboardLabel
                    position={[0, -5, 0]}
                    label="NOAA SWPC: SOLAR_ACTIVITY_MONITOR"
                    value={`Kp Index: ${realData?.solarKp || 'LOADING...'}`}
                    color="#ffaa00"
                />
                {focusedModule === 'SOLAR' && <DetailPanel position={[0, 8, 0]} text={`SOLAR PROBABILITY:\nFlare Risk: ${(realData?.solarKp || 0) * 10}%\nCME Impact: LOW`} color="#ffaa00" />}
            </group>

            {/* 2. SEISMIC MONITOR (USGS DATA) */}
            <group position={[0, -10, 0]} onClick={() => setFocusedModule('SEISMIC')}>
                <SeismicEarth mag={realData?.earthMag || 0} place={realData?.status} />
                <DashboardLabel
                    position={[0, -6, 0]}
                    label="USGS: SEISMIC_NETWORK"
                    value={`Max Mag: ${realData?.earthMag || 0} | ${realData?.earthMag ? 'ACTIVE' : 'CALM'}`}
                    color="#00ff44"
                />
                {focusedModule === 'SEISMIC' && <DetailPanel position={[0, 8, 0]} text={`TECTONIC PROBABILITY:\nPlate Stress: HIGH\nAftershock Risk: ${(realData?.earthMag || 0) * 12}%`} color="#00ff44" />}
            </group>

            {/* 3. NEO RADAR (NASA DATA) */}
            <group position={[25, 10, -10]} onClick={() => setFocusedModule('NEO')}>
                <NeoTracker distance={realData?.neoDist || 0} />
                <DashboardLabel
                    position={[0, -5, 0]}
                    label="NASA CNEOS: NEO_TRACKER"
                    value={`Closest Approach: ${realData?.neoDist?.toFixed(2) || '---'} LD`}
                    color="#ff3366"
                />
                {focusedModule === 'NEO' && <DetailPanel position={[0, 8, 0]} text={`IMPACT PROBABILITY:\nOrbit Intersection: 0.0001%\nKinetic Potential: MEGATON`} color="#ff3366" />}
            </group>

            {/* 4. TELEMETRY TERMINAL & SYNC CONTROL */}
            <group position={[0, 25, -20]}>
                <DataLogTerminal data={realData} lastUpdate={lastUpdate} />
                {/* SYNC BUTTON */}
                <group position={[25, 0, 0]} onClick={handleSync}>
                    <mesh>
                        <boxGeometry args={[10, 4, 1]} />
                        <meshBasicMaterial color={entropy > 0 ? "#ff0000" : "#00ffff"} wireframe />
                    </mesh>
                    <Text position={[0, 0, 0.6]} fontSize={1} color="#ffffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                        {entropy > 0 ? "DESYNC CHAOS" : "SYNC UNIVERSE"}
                    </Text>
                    <Text position={[0, -3, 0]} fontSize={0.6} color="#cccccc" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                        Click to inject real-world Entropy
                    </Text>
                </group>
            </group>

// --- 5. NAVIGATION ---
            {/* Replaced MultiverseStatus with Stellar Navigation Map */}
            <StellarNavigation currentMode={viewMode || 'OPERATOR'} onNavigate={onNavigate} />
        </group>
    )
}

function DeepSpaceGrid() {
    return (
        <group rotation={[Math.PI / 2, 0, 0]} position={[0, -30, 0]}>
            <gridHelper args={[200, 40, 0x0044aa, 0x001133]} />
        </group>
    )
}

function ProbabilityCloud({ risk }: { risk: number }) {
    // A volumetric cloud that becomes redder and more chaotic as risk increases
    const count = 1000
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            p[i * 3] = (Math.random() - 0.5) * 100
            p[i * 3 + 1] = (Math.random() - 0.5) * 50
            p[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20
        }
        return p
    }, [])

    const ref = useRef<THREE.Points>(null)

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.05 * (1 + risk)
            // Pulse opacity/size could be done in shader, but simple rotation works for "Chaos"
        }
    })

    return (
        <points ref={ref}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
            </bufferGeometry>
            <pointsMaterial
                size={0.2 + risk * 0.3}
                color={new THREE.Color().setHSL(0.6 - (risk * 0.6), 1.0, 0.5)} // Blue (Safe) -> Red (Danger)
                transparent
                opacity={0.4}
                sizeAttenuation
            />
        </points>
    )
}

// --- 5. NAVIGATION (Preserved) ---
function MultiverseStatus({ currentMode, onNavigate }: { currentMode: string, onNavigate?: (mode: any) => void }) {
    const modes = ['OPERATOR', 'GRAND_UNIFIED', 'WORMHOLE', 'STRING_THEORY', 'BINARY', 'QUANTUM', 'COSMIC_WEB', 'GENESIS', 'SINGULARITY', 'FREQUENCY', 'MATRIX']

    return (
        <group position={[-50, 0, -30]}>
            <Text position={[0, 15, 0]} fontSize={1.5} color="#00ffff" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">MULTIVERSE_SYNC_STATUS</Text>
            {modes.map((mode, i) => (
                <group key={mode} position={[0, 10 - i * 3.5, 0]}>
                    <InteractiveButton
                        label={mode}
                        active={mode === currentMode}
                        onClick={() => onNavigate && onNavigate(mode)}
                    />
                </group>
            ))}
        </group>
    )
}

function InteractiveButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    const [hovered, set] = React.useState(false)
    return (
        <group onClick={onClick} onPointerOver={() => set(true)} onPointerOut={() => set(false)}>
            <mesh position={[-2, 0, 0]}>
                <circleGeometry args={[0.8, 16]} />
                <meshBasicMaterial
                    color={active ? "#00ff00" : (hovered ? "#00ffff" : "#ffffff")}
                    transparent={true}
                    opacity={active || hovered ? 1 : 0.2}
                />
            </mesh>
            <Text position={[8, 0, 0]} fontSize={1.2} color={active ? "#00ff00" : (hovered ? "#00ffff" : "#cccccc")} textAlign="left" font="/fonts/Roboto-VariableFont_wdth,wght.ttf">
                {label} {active ? '>> ACTIVE' : (hovered ? '>> WARP' : '>> STANDBY')}
            </Text>
        </group>
    )
}
