import React, { useState, useEffect } from 'react'

interface UniversalHUDProps {
    viewMode: string
    onNavigate: (mode: string) => void
    universeState: {
        entropy: number
        sync: number
        biologicalLife: number
        civilization: string
    }
    lssiData: any
    apiStatus: { label: string, color: string }
    eventLog: string[]
    interactions: any[]
    physics: { equation: string, constants: string }
    onToggleSettings?: () => void
    symbiosis: boolean
    onToggleSymbiosis: () => void
    isDecoding: boolean
    onToggleDecoder: () => void
}

export default function UniversalHUD({
    viewMode,
    onNavigate,
    universeState,
    lssiData,
    apiStatus,
    eventLog,
    physics,
    symbiosis,
    onToggleSymbiosis,
    isDecoding,
    onToggleDecoder,
}: UniversalHUDProps) {
    const [isExpanded, setExpanded] = useState(true)
    const [activePanel, setActivePanel] = useState<'NAV' | 'DATA' | 'NONE'>('NAV')

    // Formatting
    const entropyPercent = (universeState.entropy * 100).toFixed(0) + '%'
    const syncPercent = (universeState.sync * 100).toFixed(0) + '%'
    const lssiValue = lssiData ? lssiData.lssi.toFixed(1) : 'WAIT'

    return (
        <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between overflow-hidden">

            {/* --- TOP CORTEX BAR (System Status) --- */}
            <header className="pointer-events-auto w-full p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm transition-all duration-500">

                {/* Identity / Mode */}
                <div className="flex flex-col group mobile-hide-header">
                    <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 font-orbitron drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] mobile-title">
                        {viewMode.replace('_', ' ')}
                    </h1>
                    <div className="flex items-center gap-2 mt-1 opacity-60 group-hover:opacity-100 transition-opacity mobile-equation">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-mono text-cyan-500 tracking-widest">{physics.equation}</span>
                    </div>
                </div>


                {/* Central Truth Monitors (The Eye) */}
                <div className="absolute left-1/2 -translate-x-1/2 top-4 flex gap-6 mobile-metrics">
                    <TruthMetric label="ENTROPY" value={entropyPercent} color={universeState.entropy > 0.8 ? 'text-red-500' : 'text-cyan-400'} />
                    <div className="w-px h-8 bg-white/10 mobile-hide" />
                    <TruthMetric label="SYNC" value={syncPercent} color="text-purple-400" />
                    <div className="w-px h-8 bg-white/10 mobile-hide" />
                    <TruthMetric label="LSSI" value={lssiValue} color={Number(lssiValue) > 50 ? 'text-red-500' : 'text-green-400'} />
                </div>


                {/* System Link Status */}
                <div className="flex flex-col items-end">
                    <div className={`px-3 py-1 rounded-full border border-white/10 bg-black/40 backdrop-blur-md flex items-center gap-2 ${apiStatus.color === 'text-red-500' ? 'animate-pulse' : ''}`}>
                        <span className="text-[8px] uppercase tracking-widest text-white/50">UPLINK</span>
                        <span className={`text-[9px] font-bold ${apiStatus.color}`}>{apiStatus.label}</span>
                    </div>
                    <div className="mt-2 text-[9px] font-mono text-white/30 text-right">
                        {physics.constants}
                    </div>
                </div>
            </header>

            {/* --- MIDDLE LAYER (Dynamic Overlays) --- */}
            <div className="flex-1 relative">
                {/* Floating Intelligence Feed (Left) */}
                <div className={`absolute top-10 left-6 w-64 pointer-events-auto transition-transform duration-500 ${isExpanded ? 'translate-x-0' : '-translate-x-80'}`}>
                    <div className="glass-panel p-4 bg-black/30 border-l-2 border-cyan-500/50 backdrop-blur-md rounded-r-lg">
                        <h3 className="text-[10px] font-black text-cyan-500 mb-2 uppercase tracking-widest">INTELLIGENCE_STREAM</h3>
                        <div className="space-y-2 font-mono text-[9px]">
                            {eventLog.slice(0, 5).map((log, i) => (
                                <div key={i} className={`flex gap-2 ${i === 0 ? 'text-white' : 'text-white/30'}`}>
                                    <span className="opacity-50">[{new Date().toLocaleTimeString().split(' ')[0]}]</span>
                                    <span>{log}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM CORTEX (Navigation Matrix) --- */}
            <footer className="pointer-events-auto w-full p-6 flex flex-col items-center gap-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">

                {/* Navigation Tabs */}
                {activePanel === 'NAV' && (
                    <div className="flex flex-wrap justify-center gap-2 max-w-4xl animate-fade-in-up">
                        <NavPill label="GRAND UNIFIED" active={viewMode === 'GRAND_UNIFIED'} onClick={() => onNavigate('GRAND_UNIFIED')} />
                        <NavPill label="QUANTUM" active={viewMode === 'QUANTUM'} onClick={() => onNavigate('QUANTUM')} />
                        <NavPill label="COSMIC WEB" active={viewMode === 'COSMIC_WEB'} onClick={() => onNavigate('COSMIC_WEB')} />
                        <NavPill label="STRING THEORY" active={viewMode === 'STRING_THEORY'} onClick={() => onNavigate('STRING_THEORY')} />
                        <span className="w-px h-6 bg-white/10 mx-2 self-center" />
                        <NavPill label="MATRIX" active={viewMode === 'MATRIX'} onClick={() => onNavigate('MATRIX')} />
                        <NavPill label="DECODER" active={viewMode === 'DECODER'} onClick={() => onNavigate('DECODER')} />
                        <NavPill label="NEURAL" active={viewMode === 'NEURAL_NETWORK'} onClick={() => onNavigate('NEURAL_NETWORK')} />
                        <NavPill label="BIOLOGIC" active={viewMode === 'BIOLOGIC'} onClick={() => onNavigate('BIOLOGIC')} />
                        <NavPill label="PERCEPTION" active={viewMode === 'PERCEPTION'} onClick={() => onNavigate('PERCEPTION')} />
                        <span className="w-px h-6 bg-white/10 mx-2 self-center" />
                        <NavPill label="DUAL MIND" active={viewMode === 'DUAL_MIND'} onClick={() => onNavigate('DUAL_MIND')} />
                        <NavPill label="EPISTEMIC WAR" active={viewMode === 'EPISTEMIC_WAR'} onClick={() => onNavigate('EPISTEMIC_WAR')} />
                        <NavPill label="DARK FOREST" active={viewMode === 'DARK_FOREST'} onClick={() => onNavigate('DARK_FOREST')} />
                        <NavPill label="SILENCE" active={viewMode === 'GREAT_SILENCE'} onClick={() => onNavigate('GREAT_SILENCE')} />
                    </div>

                )}

                {/* Toggle Bar */}
                <div className="flex gap-4 items-center">
                    <ControlButton label={activePanel === 'NAV' ? 'HIDE NAV' : 'NAVIGATION'} active={activePanel === 'NAV'} onClick={() => setActivePanel(activePanel === 'NAV' ? 'NONE' : 'NAV')} />
                    <ControlButton label={isExpanded ? 'FOCUS MODE' : 'SHOW DATA'} active={!isExpanded} onClick={() => setExpanded(!isExpanded)} />

                    <div className="w-px h-4 bg-white/20 mx-2" />

                    <ControlButton
                        label={symbiosis ? 'SYMBIOSIS: ON' : 'SYMBIOSIS: OFF'}
                        active={symbiosis}
                        onClick={onToggleSymbiosis}
                    />
                    <ControlButton
                        label={isDecoding ? 'DECODER: ON' : 'DECODER: OFF'}
                        active={isDecoding}
                        onClick={onToggleDecoder}
                    />
                </div>
            </footer>

            {/* Background Noise/Scanlines (Visual Polish) */}
            <div className="absolute inset-0 pointer-events-none opacity-5 bg-[url('data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E')] mix-blend-overlay" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-cyan-900/5 to-transparent opacity-20" />
        </div>
    )
}

function TruthMetric({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className="flex flex-col items-center truth-metric">
            <span className="text-[9px] font-bold text-white/40 tracking-widest">{label}</span>
            <span className={`text-xl font-black ${color} tracking-tighter drop-shadow-md`}>{value}</span>
        </div>
    )
}


function NavPill({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-sm border text-[9px] font-black tracking-widest transition-all duration-300 nav-pill
            ${active
                    ? 'bg-cyan-500 text-black border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.4)] scale-105'
                    : 'bg-black/40 text-white/50 border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10'}
            `}
        >
            {label}
        </button>
    )
}


function ControlButton({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-1 rounded-full text-[8px] font-bold tracking-[0.2em] border transition-all control-button
            ${active
                    ? 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-transparent text-white/30 hover:text-white'}
            `}
        >
            {label}
        </button>
    )
}

