import React, { useEffect, useState, Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration, Glitch } from '@react-three/postprocessing'
import { PerspectiveCamera, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

import ThinkingUniverse from './components/ThinkingUniverse'
import ClusterDetail from './components/ClusterDetail'
import StringTheoryUniverse from './components/StringTheoryUniverse'
import BinaryUniverse from './components/BinaryUniverse'
import QuantumRealm from './components/QuantumRealm'
import CosmicWeb from './components/CosmicWeb'
import Wormhole from './components/Wormhole'
import LifeSim from './components/LifeSim'
import InformationSingularity from './components/InformationSingularity'
import UniverseCodex from './components/UniverseCodex'
import UnifiedUniverse from './components/UnifiedUniverse'
import NeuralSymbiosis from './components/NeuralSymbiosis'
import DigitalRain from './components/DigitalRain'
import GenesisUniverse, { GenesisUI, GenesisController } from './components/GenesisScene'
import UniversalAgentOverlay from './components/UniversalAgentOverlay'
import UniverseDecoder from './components/UniverseDecoder'
import FrequencyUniverse from './components/FrequencyUniverse'
import { UniverseDecoderService, LSSIData } from './services/universeDecoder';
import BinaryFrequencyUniverse from './components/BinaryFrequencyUniverse';
import BinaryUniverseScene from './components/BinaryUniverseScene';
import MatrixUniverse from './components/MatrixUniverse';
import InteractionEngine from './components/InteractionEngine';
import InfiniteZoomManager from './components/InfiniteZoomManager';

import { Leva, useControls } from 'leva'
import './styles.css'

type ViewMode = 'OPERATOR' | 'GRAND_UNIFIED' | 'WORMHOLE' | 'STRING_THEORY' | 'BINARY' | 'QUANTUM' | 'COSMIC_WEB' | 'GENESIS' | 'SINGULARITY' | 'FREQUENCY' | 'DECODER' | 'MATRIX'

export default function App() {
  const [manifest, setManifest] = useState<any>(null)
  const [selectedCluster, setSelectedCluster] = useState<any>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('OPERATOR')
  const [showHUD, setShowHUD] = useState(false)
  const [isCodexOpen, setIsCodexOpen] = useState(false)
  const [mouse, setMouse] = useState(new THREE.Vector2(0, 0))
  const [isInfiniteZoom, setIsInfiniteZoom] = useState(false)
  const [interactions, setInteractions] = useState<any[]>([])
  const [eventLog, setEventLog] = useState<string[]>(["SYSTEM_INITIALIZED", "QUANTUM_LINK_STABLE"])
  const [isDecoding, setIsDecoding] = useState(false)
  const [mouseSpeed, setMouseSpeed] = useState(0)
  const lastMouse = useRef(new THREE.Vector2(0, 0))
  const [techStage, setTechStage] = useState(0)
  const [symbiosis, setSymbiosis] = useState(true)
  const [lssiData, setLssiData] = useState<LSSIData | null>(null)

  // Genesis States (Lifting to App to avoid nested canvas)
  const [genesisAge, setGenesisAge] = useState(0)
  const [genesisRunning, setGenesisRunning] = useState(false)
  const [genesisViewState, setGenesisViewState] = useState<'VOID' | 'BANG' | 'GALAXY' | 'PLANET'>('VOID')

  useEffect(() => {
    if (genesisAge > 0 && genesisAge < 5) setGenesisViewState('BANG')
    if (genesisAge >= 5 && genesisViewState !== 'PLANET') setGenesisViewState('GALAXY')
  }, [genesisAge])

  // Global Universe State
  const [universeState, setUniverseState] = useState({
    entropy: 0.1,
    sync: 0.98,
    biologicalLife: 0.5,
    civilization: 'TYPE I'
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTechStage(prev => Math.min(1, prev + 0.01))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const updateLSSI = async () => {
      const data = await UniverseDecoderService.fetchFullStatus()
      setLssiData(data)
    }
    updateLSSI()
    const timer = setInterval(updateLSSI, 30000)
    return () => clearInterval(timer)
  }, [])

  const physics = useMemo(() => {
    switch (viewMode) {
      case 'GENESIS': return { equation: "H^2 = (8πG/3)ρ - k/a^2", constants: "G ≈ 6.674e-11, c ≈ 2.997e8" }
      case 'QUANTUM': return { equation: "iℏ ∂ψ/∂t = Ĥψ", constants: "ℏ ≈ 1.054e-34, m_e ≈ 9.1e-31" }
      case 'STRING_THEORY': return { equation: "L = 1/2π α' ∫ d²σ √-γ ...", constants: "α' ≈ ( Planck_L )^2" }
      case 'BINARY': return { equation: "I(X) = -Σ P(x) log P(x)", constants: "S_bit = k ln 2" }
      case 'COSMIC_WEB': return { equation: "∇²Φ = 4πGρ̅δ", constants: "Ω_m ≈ 0.3, Ω_Λ ≈ 0.7" }
      case 'SINGULARITY': return { equation: "Ψ_{eternal} = exp(iS/ℏ)", constants: "ρ_vac ≈ 10^{120}" }
      case 'WORMHOLE': return { equation: "ds^2 = -dt^2 + dl^2 + (b^2+l^2)dΩ^2", constants: "ER_BRIDGE = STABLE" }
      case 'GRAND_UNIFIED': return { equation: "L = R + (1/4)F^2 + ...", constants: "TOE = 1.0" }
      case 'MATRIX': return { equation: "Σ 2^n * b_n", constants: "Simulation = Active" }
      case 'FREQUENCY': return { equation: "E = hν (Planck-Einstein)", constants: "h = 6.626 x 10^-34 Js, CMB peak = 160.2 GHz" }
      case 'DECODER': return { equation: "Gμν + Λgμν = 8πG/c^4 Tμν", constants: "S = Akc^3/4Għ, Z = ∫DgDφ e^iS/ħ" }
      default: return { equation: "S_neural = -Σ p log p", constants: "Ψ_sync = 1.0" }
    }
  }, [viewMode])

  const { depth, chaos, bloom, transcendence, lifeDensity } = useControls({
    transcendence: { value: false, label: 'TRANSCENDENCE_MODE' },
    lifeDensity: { value: 0.5, min: 0, max: 1, label: 'LIFE_DENSITY' },
    depth: { value: 0.5, min: 0, max: 1, label: 'REALITY_DEPTH' },
    chaos: { value: 0.1, min: 0, max: 1, label: 'ENTROPY' },
    bloom: { value: 1.5, min: 0, max: 5, label: 'NEURAL_GLOW' }
  })

  const apiStatus = useMemo(() => {
    if (!lssiData) return { label: 'SYNCHRONIZING...', color: 'text-white/40' };
    return { label: 'MATRIX_STABLE', color: 'text-cyan-400' };
  }, [lssiData])

  useEffect(() => {
    fetch('/manifest.json')
      .then(r => r.json())
      .then(d => setManifest(d))
      .catch(console.error)
  }, [])

  useEffect(() => {
    const events = ["STRING_TENSION_RISING", "BOSON_COLLISION_DETECTED", "HOLOGRAPHIC_SYNC_INIT", "VOID_FLUCTUATION_PEAK", "NEURAL_SYNAPSE_FIRE", "CMB_SIGNAL_DETECTED", "FREQUENCY_LOCK_INITIATED", "SPECTRAL_DENSITY_STABLE"];
    const interval = setInterval(() => {
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      setEventLog(prev => [randomEvent, ...prev].slice(0, 5));
    }, 4000);
    return () => clearInterval(interval);
  }, [])

  useEffect(() => {
    setUniverseState(prev => ({
      ...prev,
      entropy: chaos,
      biologicalLife: lifeDensity,
      civilization: lifeDensity > 0.8 ? 'TYPE III' : lifeDensity > 0.4 ? 'TYPE II' : 'TYPE I'
    }))
  }, [chaos, lifeDensity])

  const handleMouseMove = (e: React.MouseEvent) => {
    const nextMouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    )
    const speed = nextMouse.distanceTo(lastMouse.current)
    setMouseSpeed(prev => THREE.MathUtils.lerp(prev, speed, 0.1))
    lastMouse.current.copy(nextMouse)
    setMouse(nextMouse)
  }

  const renderUniverse = () => {
    return (
      <group>
        <SpacetimeFoam chaos={chaos} />
        {symbiosis && <NeuralSymbiosis observer={mouse} intensity={techStage} />}
        {isDecoding && <DigitalRain intensity={mouseSpeed * 10.0} observer={mouse} />}
        <Starfield />
        {(() => {
          switch (viewMode) {
            case 'GENESIS': return (
              <>
                <GenesisUniverse chaos={chaos} age={genesisAge} viewState={genesisViewState} onGalaxyClick={() => genesisViewState === 'GALAXY' && setGenesisViewState('PLANET')} />
                <GenesisController running={genesisRunning} setAge={setGenesisAge} />
              </>
            )
            case 'STRING_THEORY': return <StringTheoryUniverse observer={mouse} speed={mouseSpeed} isDecoding={isDecoding} chaos={chaos} />
            case 'BINARY': return (
              <>
                <BinaryUniverse depth={depth} observer={mouse} isDecoding={isDecoding} />
                <BinaryUniverseScene />
              </>
            )
            case 'QUANTUM': return <QuantumRealm observer={mouse} entropy={chaos} isDecoding={isDecoding} />
            case 'COSMIC_WEB': return <CosmicWeb clusters={manifest?.clusters} isDecoding={isDecoding} />
            case 'WORMHOLE': return <Wormhole isDecoding={isDecoding} />
            case 'SINGULARITY': return <InformationSingularity isDecoding={isDecoding} />
            case 'GRAND_UNIFIED': return <UnifiedUniverse observer={mouse} entropy={chaos} depth={depth} isDecoding={isDecoding} speed={mouseSpeed} />
            case 'FREQUENCY': return <FrequencyUniverse observer={mouse} entropy={chaos} isDecoding={isDecoding} />
            case 'MATRIX': return <MatrixUniverse chaos={chaos} />
            case 'DECODER': return <UniverseDecoder observer={mouse} entropy={universeState.entropy} isDecoding={isDecoding} lssi={lssiData?.lssi || 0} interactions={interactions} viewMode={viewMode} />
            default:
              return <ThinkingUniverse clusters={manifest?.clusters || []} onClusterSelect={setSelectedCluster} chaosLevel={chaos} />
          }
        })() as any}
        <LifeSim mode={viewMode} density={lifeDensity} />
        <UniversalAgentOverlay observer={mouse} />
        <InteractionEngine
          isDecoding={isDecoding}
          onInteraction={(data) => setInteractions(prev => [data, ...prev].slice(0, 10))}
        />
      </group>
    )
  }

  if (!manifest) return <div className="loading-terminal">TRANSCENDING REALITY...</div>

  return (
    <div
      className={`h-screen w-screen bg-black overflow-hidden relative font-mono text-white ${transcendence ? 'transcendence-active' : ''}`}
      onMouseMove={handleMouseMove}
    >
      <div className="neural-noise pointer-none" />
      <div className="crt-overlay pointer-none" />
      <div className="scanline pointer-none" />

      <div className="absolute-full z-0">
        <Canvas
          gl={{ powerPreference: 'high-performance', antialias: false }}
          style={{ touchAction: 'none' }}
        >
          <PerspectiveCamera makeDefault position={viewMode === 'WORMHOLE' ? [0, 0, 50] : [0, 0, 100]} fov={viewMode === 'WORMHOLE' ? 70 : 50} />
          <OrbitControls makeDefault enablePan enableZoom enableRotate autoRotate={viewMode === 'OPERATOR'} />
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 20, 20]} intensity={1.5} />

          <Suspense fallback={null}>
            {renderUniverse()}
            <CameraDrift />
            <InfiniteZoomManager active={isInfiniteZoom} onComplete={() => setIsInfiniteZoom(false)} />
          </Suspense>

          <EffectComposer multisampling={8}>
            <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.9} height={512} intensity={bloom * 2.0} />
            <Noise opacity={0.1 + chaos * 0.2} />
            <Vignette eskil={false} offset={0.05} darkness={1.15} />
            <ChromaticAberration
              offset={new THREE.Vector2(0.01 * chaos, 0.01 * chaos)}
              radialModulation={true}
              modulationOffset={0.7}
            />
            {transcendence && <Glitch delay={new THREE.Vector2(1, 2)} duration={new THREE.Vector2(0.15, 0.3)} strength={new THREE.Vector2(0.3, 0.5)} />}
            {chaos > 0.8 && <Glitch delay={new THREE.Vector2(0.1, 0.5)} duration={new THREE.Vector2(0.05, 0.1)} strength={new THREE.Vector2(chaos * 0.5, chaos)} />}
          </EffectComposer>
        </Canvas>
      </div>

      <div className={`fixed-full z-10 pointer-none transition-opacity duration-700 ${showHUD ? 'opacity-100' : 'opacity-0'}`}>
        <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start">
          <div className={`flex flex-col gap-2 pointer-auto group ${chaos > 0.7 ? 'animate-glitch' : ''}`}>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white font-orbitron drop-shadow-[0_0_15px_rgba(0,242,255,0.4)]">
              {viewMode.replace('_', ' ')}
            </h1>
            <div className="glass-panel px-4 py-2 border border-cyan-500/20 rounded shadow-lg bg-black-60">
              <code className="text-[12px] text-cyan-400 font-mono tracking-widest">{physics.equation}</code>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-auto">
            <div className="glass-panel px-6 py-3 bg-black-80 backdrop-blur-2xl border border-white/10 rounded-full flex gap-8 items-center shadow-2xl">
              <HUDStat label="ENTROPY" value={(universeState.entropy * 100).toFixed(0) + '%'} color="text-red-400" />
              <div className="w-px h-5 bg-white/10" />
              <HUDStat label="SYNC" value={(universeState.sync * 100).toFixed(0) + '%'} color="text-green-400" />
              <div className="w-px h-5 bg-white/10" />
              <HUDStat label="LSSI" value={lssiData ? lssiData.lssi.toFixed(1) : '...'} color={lssiData && lssiData.lssi > 50 ? 'text-red-500' : 'text-cyan-400'} />
            </div>
            <div className={`flex gap-2 items-center bg-black-60 px-3 py-1 rounded-full border border-white/5 backdrop-blur-md ${chaos > 0.8 ? 'animate-pulse' : ''}`}>
              <span className="text-[8px] text-white/30 font-bold tracking-ultra-wide uppercase">SYSTEM_LINK:</span>
              <span className={`text-[8px] font-bold tracking-ultra-wide uppercase ${apiStatus.color}`}>{apiStatus.label}</span>
            </div>
          </div>

          <div className={`w-72 pointer-auto bg-black-60 p-3 rounded border border-white/5 backdrop-blur-md ${chaos > 0.9 ? 'animate-glitch' : ''}`}>
            <div className="flex flex-col items-end gap-2">
              <p className="text-[8px] text-cyan-500 font-black tracking-ultra-wide uppercase mb-1 border-b border-cyan-500/20 w-full text-right pb-1">INTELLIGENCE_FEED</p>
              {eventLog.slice(0, 3).map((log, i) => (
                <div key={i} className={`text-[10px] font-mono text-right transition-all duration-500 ${i === 0 ? 'text-white' : 'text-white/20'}`}>
                  {`[${new Date().toLocaleTimeString().split(' ')[0]}] ${log}`}
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="absolute left-6 top-48 bottom-48 w-[320px] pointer-auto transition-transform duration-700 delay-100" style={{ transform: showHUD ? 'translateX(0)' : 'translateX(-400px)' }}>
          <section className="glass-panel p-6 h-full flex flex-col bg-black-60 border border-white/10">
            <div className="hud-accent accent-tl" />
            <div className="hud-accent accent-bl" />
            <p className="text-[11px] text-cyan-400 font-black mb-8 tracking-tight-wide border-b border-cyan-400/20 pb-2">REALITY_MODULATORS</p>
            <div className="space-y-8 overflow-y-auto pr-3 custom-scrollbar flex-1">
              <Modulator label="DIMENSIONAL_DEPTH" value={depth} />
              <Modulator label="QUANTUM_DENSITY" value={lifeDensity} />
              <Modulator label="ENTROPY_GAP" value={chaos} />
              <Modulator label="NEURAL_SATURATION" value={bloom / 5} />
              <div className="pt-8 space-y-3">
                <Toggle active={symbiosis} onClick={() => setSymbiosis(!symbiosis)} label="NEURAL_SYMBIOSIS" />
                <Toggle active={isDecoding} onClick={() => setIsDecoding(!isDecoding)} label="UNIVERSE_DECODER" />
              </div>
            </div>
          </section>
        </div>

        <div className="absolute right-6 top-48 bottom-48 w-[320px] pointer-auto transition-transform duration-700 delay-200" style={{ transform: showHUD ? 'translateX(0)' : 'translateX(400px)' }}>
          <section className="h-full flex flex-col gap-6">
            <div className="flex-1 min-h-0"><EvolutionaryTerminal /></div>
            <div className="glass-panel p-6 bg-black-80 border border-white/10 rounded-sm">
              <div className="hud-accent accent-tr" /><div className="hud-accent accent-br" />
              <p className="text-[11px] text-cyan-400 font-bold mb-4 tracking-widest border-b border-cyan-400/20 pb-2 uppercase text-white-glow">Local_Coordinates</p>
              <div className="font-mono text-[10px] text-cyan-300/40 space-y-2">
                <p className="flex justify-between"><span>SDSS_HASH</span> <span className="text-cyan-400">0x{Math.random().toString(16).slice(2, 8).toUpperCase()}</span></p>
                <p className="flex justify-between"><span>LAYER_ID</span> <span className="text-cyan-400">01</span></p>
                <p className="flex justify-between"><span>VECTOR_X</span> <span className="text-white">{mouse.x.toFixed(6)}</span></p>
                <p className="flex justify-between"><span>VECTOR_Y</span> <span className="text-white">{mouse.y.toFixed(6)}</span></p>
              </div>
              <div className="mt-8 pt-4 border-t border-cyan-400/10 h-32 overflow-hidden">
                <p className="text-[9px] text-cyan-500/50 mb-2 uppercase tracking-tighter">Interaction_Stream</p>
                <div className="space-y-1">
                  {interactions.map((int, i) => (
                    <p key={i} className="text-[9px] flex justify-between">
                      <span className="text-white-glow">{int.name}</span>
                      <span className="text-cyan-500/40">[{int.type}]</span>
                    </p>
                  ))}
                </div>
              </div>
              <div className="mt-8">
                <button onClick={() => setIsCodexOpen(true)} className="w-full py-4 bg-cyan-500 bg-opacity-10 border border-cyan-500 text-[11px] font-black tracking-ultra-wide hover:bg-cyan-500 hover:text-black transition-all text-cyan-400 uppercase shadow-lg">SCAN_REALITY</button>
              </div>
            </div>
          </section>
        </div>

        <div className="absolute bottom-6 right-6 pointer-auto">
          <div className="glass-panel p-2 bg-black-60 border border-white/5 rounded backdrop-blur-md">
            <Leva isRoot={false} fill flat titleBar={false} theme={{ colors: { highlight1: '#00ccff', highlight2: '#00ccff' } as any }} />
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowHUD(!showHUD)}
        className="absolute top-6 right-6 z-50 pointer-auto w-12 h-12 rounded-full border border-cyan-500 bg-black-60 flex items-center justify-center text-cyan-500 hover:bg-cyan-500 hover:text-black transition-all group shadow-2xl"
        title={showHUD ? "Hide HUD" : "Show HUD"}
      >
        <div className="relative w-6 h-6">
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showHUD ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>
          </span>
          <span className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${showHUD ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </span>
        </div>
      </button>

      {
        !showHUD && (
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3 pointer-auto animate-fade-in">
            <div className="text-[10px] text-cyan-400 font-bold tracking-ultra-wide uppercase pointer-none">Navigation Matrix</div>
            <div className="glass-panel p-2 flex gap-1 bg-black-60 px-3 rounded-full border border-white border-opacity-10 backdrop-blur-xl shadow-2xl">
              <NavButton active={viewMode === 'OPERATOR'} onClick={() => setViewMode('OPERATOR')} label="UNIVERSE" />
              <div className="w-px h-4 bg-white/10 mx-1 self-center" />
              <NavButton active={viewMode === 'GRAND_UNIFIED'} onClick={() => setViewMode('GRAND_UNIFIED')} label="UNITY" />
              <NavButton active={viewMode === 'WORMHOLE'} onClick={() => setViewMode('WORMHOLE')} label="PORTAL" />
              <NavButton active={viewMode === 'COSMIC_WEB'} onClick={() => setViewMode('COSMIC_WEB')} label="NET" />
              <NavButton active={viewMode === 'QUANTUM'} onClick={() => setViewMode('QUANTUM')} label="ATOM" />
              <NavButton active={viewMode === 'MATRIX'} onClick={() => setViewMode('MATRIX')} label="MATRIX" />
              <button
                onClick={() => setIsInfiniteZoom(!isInfiniteZoom)}
                className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest transition-all ${isInfiniteZoom ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)]' : 'text-white/70 hover:text-white hover:bg-white/10 border border-white/20'}`}
              >∞ ZOOM</button>
              <div className="w-px h-4 bg-white/10 mx-1 self-center" />
              <NavButton active={viewMode === 'DECODER'} onClick={() => setViewMode('DECODER')} label="DECODE" />
              <button
                onClick={() => setViewMode('SINGULARITY')}
                className={`px-4 py-1.5 rounded-full text-[9px] font-bold tracking-widest transition-all ${viewMode === 'SINGULARITY' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'text-amber-500/70 hover:text-amber-500 hover:bg-amber-500/10'}`}
              >CORE</button>
              <div className="w-px h-4 bg-white/10 mx-1 self-center" />
              <NavButton active={viewMode === 'GENESIS'} onClick={() => setViewMode('GENESIS')} label="BIG BANG" />
            </div>
          </div>
        )
      }

      <UniverseCodex mode={viewMode} isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />

      {viewMode === 'GENESIS' && (
        <GenesisUI
          age={genesisAge}
          running={genesisRunning}
          setRunning={setGenesisRunning}
          viewState={genesisViewState}
          setViewState={setGenesisViewState}
        />
      )}

      {(viewMode === 'BINARY' || viewMode === 'MATRIX' || viewMode === 'FREQUENCY') && (
        <BinaryFrequencyUniverse equation={physics.equation} constants={physics.constants} />
      )}
      {viewMode === 'OPERATOR' && selectedCluster && <ClusterDetail cluster={selectedCluster} onClose={() => setSelectedCluster(null)} />}
    </div>
  )
}

function SpacetimeFoam({ chaos }: { chaos: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 }, uChaos: { value: chaos } },
    vertexShader: `
            varying vec3 vPos;
            void main() {
                vPos = position;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
    fragmentShader: `
            varying vec3 vPos;
            uniform float uTime;
            uniform float uChaos;

            float hash(vec3 p) {
                p = fract(p * vec3(443.897, 441.423, 437.195));
                p += dot(p, p.yzx + 19.19);
                return fract((p.x + p.y) * p.z);
            }

            float noise(vec3 p) {
                vec3 i = floor(p);
                vec3 f = fract(p);
                f = f * f * (3.0 - 2.0 * f);
                return mix(
                    mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
                        mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                        mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y), f.z);
            }

            void main() {
                vec3 p = vPos * 0.04;
                float t = uTime * 0.15;
                float n = noise(p + t);
                n += noise(p * 2.0 - t) * 0.5;
                n += noise(p * 4.0 + t * 0.5) * 0.25;
                float glow = pow(abs(n), 3.0);
                vec3 baseColor = mix(vec3(0.005, 0.015, 0.03), vec3(0.0, 0.2, 0.4), uChaos);
                vec3 highlightColor = vec3(0.0, 0.8, 1.0);
                vec3 finalColor = mix(baseColor, highlightColor, glow * (0.5 + uChaos));
                gl_FragColor = vec4(finalColor, (0.05 + uChaos * 0.1) * glow);
            }
        `,
    transparent: true,
    side: THREE.BackSide,
    depthWrite: false
  }), [])

  useFrame((state) => {
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.ShaderMaterial
      mat.uniforms.uTime.value = state.clock.getElapsedTime()
      mat.uniforms.uChaos.value = chaos
    }
  })

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[250, 32, 32]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

function Starfield() {
  const count = 5000
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 150 + Math.random() * 300
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
    }
    return pos
  }, [])
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.5} color="#fff" sizeAttenuation transparent opacity={0.4} />
    </points>
  )
}

function CameraDrift() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    state.camera.position.x += Math.sin(t * 0.5) * 0.01
    state.camera.position.y += Math.cos(t * 0.3) * 0.01
    state.camera.lookAt(0, 0, 0)
  })
  return null
}

function NavButton({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`nav-matrix-button px-4 py-2 text-[9px] font-black tracking-widest transition-all border rounded-full ${active ? 'nav-matrix-active text-black' : 'bg-black/20 text-cyan-500/40 border-white/5 hover:border-cyan-500/30 hover:text-cyan-400'}`}
    >
      {label}
    </button>
  )
}

function ReturnButton({ onClick }: any) {
  return (
    <div className="absolute top-4 right-4 z-50 pointer-events-auto">
      <button onClick={onClick} className="glass-panel px-6 py-2 text-xs font-bold hover:bg-cyan-500 hover:text-black transition-all">
        RETURN_TO_SINGULARITY
      </button>
    </div>
  )
}

function HUDStat({ label, value, color }: any) {
  return (
    <div className="flex flex-col border-r border-white border-opacity-10 pr-6 last:border-0 items-center">
      <span className="text-8px opacity-40 font-bold tracking-widest">{label}</span>
      <span className={`text-[16px] font-black ${color} tracking-tighter`}>{value}</span>
    </div>
  )
}

function EvolutionaryTerminal() {
  const [logs, setLogs] = useState<string[]>(['NEURAL_LINK: INITIALIZING...'])
  useEffect(() => {
    const messages = ["DECODING_STRING_VIBRATIONS...", "QUANTUM_STATE_MAPPING: STABLE", "LANDAUER_THRESHOLD_REACHED", "OBSERVER_PERTURBATION_DETECTED", "FLRW_EXPANSION_CALIBRATED", "DATA_SINGULARITY_EMERGENT", "NEURAL_INTERCEPT: ACTIVE"]
    const interval = setInterval(() => {
      setLogs(prev => [messages[Math.floor(Math.random() * messages.length)], ...prev.slice(0, 5)])
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="glass-panel p-6 h-full border border-amber-500/30 bg-black/60 font-mono flex flex-col rounded-sm">
      <div className="hud-accent accent-tl" />
      <div className="hud-accent accent-bl" />
      <div className="text-[11px] text-amber mb-4 border-b border-amber/20 pb-2 font-black tracking-[0.4em] uppercase">Evolutionary_Stream</div>
      <div className="space-y-3 overflow-hidden flex-1">
        {logs.map((log, i) => (
          <div key={i} className={`text-[10px] ${i === 0 ? 'text-amber' : 'text-amber/20'} tracking-widest transition-all duration-500 ${i === 0 ? 'translate-x-1 font-bold' : ''}`}>
            {i === 0 ? '>>> ' : '  '}{log}
          </div>
        ))}
      </div>
    </div>
  )
}

function Modulator({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-8px font-bold tracking-widest px-1">
        <span className="text-white opacity-40">{label}</span>
        <span className="text-cyan-400">{value.toFixed(2)}</span>
      </div>
      <div className="h-1 bg-white bg-opacity-5 rounded-full relative overflow-hidden group">
        <div className="h-full bg-cyan-400 shadow-2xl transition-all duration-500" style={{ width: `${value * 100}%`, boxShadow: '0 0 10px #00f2ff' }} />
      </div>
    </div>
  )
}

function Toggle({ active, onClick, label }: any) {
  return (
    <button
      onClick={onClick}
      className={`w-full px-4 py-3 text-[9px] font-black tracking-widest transition-all border flex justify-between items-center relative group ${active ? 'bg-cyan-500/10 text-white border-cyan-400/30' : 'bg-black/40 text-white/20 border-white/5 hover:border-white/10'}`}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-0.5 bg-cyan-500 transition-all ${active ? 'opacity-100' : 'opacity-0'}`} />
      <span>{label}</span>
      <span className={`text-[8px] ${active ? 'text-cyan-400' : 'text-white/10'}`}>{active ? 'ON' : 'OFF'}</span>
    </button>
  )
}
