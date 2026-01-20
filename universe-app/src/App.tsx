import React, { useEffect, useState, Suspense, useMemo, useRef } from 'react'
import { Leva, useControls } from 'leva'
import EpistemicWarUniverse from './components/EpistemicWarUniverse'
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
import UniversalAgentOverlay, { AgentData } from './components/UniversalAgentOverlay'
import UniverseDecoder from './components/UniverseDecoder'
import FrequencyUniverse from './components/FrequencyUniverse'
import { UniverseDecoderService, LSSIData } from './services/universeDecoder';
import BinaryFrequencyUniverse from './components/BinaryFrequencyUniverse';
import BinaryUniverseScene from './components/BinaryUniverseScene';
import MatrixUniverse from './components/MatrixUniverse';
import InteractionEngine from './components/InteractionEngine';
import InfiniteZoomManager from './components/InfiniteZoomManager';
import DarkMatterUniverse from './components/DarkMatterUniverse';
import NeuralNetworkUniverse from './components/NeuralNetworkUniverse';
import BiologicUniverse from './components/BiologicUniverse';
import PerceptionUniverse from './components/PerceptionUniverse';
import LegendresUniverse from './components/LegendresUniverse';
import DualMindUniverse from './components/DualMindUniverse';
import DarkForestUniverse from './components/DarkForestUniverse';
import UniversalHUD from './components/interface/UniversalHUD';

// ... (inside the component return)

// ... (removed misplaced code)

{/* Universal Agent Tracker UI */ }
import './styles.css'

type ViewMode = 'OPERATOR' | 'GRAND_UNIFIED' | 'WORMHOLE' | 'STRING_THEORY' | 'BINARY' | 'QUANTUM' | 'COSMIC_WEB' | 'GENESIS' | 'SINGULARITY' | 'FREQUENCY' | 'DECODER' | 'MATRIX' | 'DARK_MATTER' | 'NEURAL_NETWORK' | 'BIOLOGIC' | 'PERCEPTION' | 'LEGENDRE' | 'EPISTEMIC_WAR' | 'DUAL_MIND' | 'DARK_FOREST'

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
  const [symbiosis, setSymbiosis] = useState(false)

  const [lssiData, setLssiData] = useState<LSSIData | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null)

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
    entropy: 0.0,
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
      case 'PERCEPTION': return { equation: "P(A|B) = [P(B|A)P(A)]/P(B)", constants: "Latency = 80ms, Filter = 99%" }
      case 'LEGENDRE': return { equation: "∃p ∈ (n², (n+1)²) ∀n ≥ 1", constants: "Gap < O(p^0.525)" }
      case 'DARK_FOREST': return { equation: "lim(t→∞) P(Survival | Silence) = 1", constants: "Hunters = ∞, Trust = 0" }
      default: return { equation: "S_neural = -Σ p log p", constants: "Ψ_sync = 1.0" }
    }
  }, [viewMode])

  const { depth, chaos, bloom, transcendence, lifeDensity } = useControls({
    transcendence: { value: false, label: 'TRANSCENDENCE_MODE' },
    lifeDensity: { value: 0.5, min: 0, max: 1, label: 'LIFE_DENSITY' },
    depth: { value: 0.5, min: 0, max: 1, label: 'REALITY_DEPTH' },
    chaos: { value: 0.0, min: 0, max: 1, label: 'ENTROPY' },
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
            case 'COSMIC_WEB': return <CosmicWeb clusters={manifest?.clusters} isDecoding={isDecoding} chaos={chaos} />
            case 'WORMHOLE': return <Wormhole isDecoding={isDecoding} chaos={chaos} />
            case 'SINGULARITY': return <InformationSingularity isDecoding={isDecoding} />
            case 'GRAND_UNIFIED': return <UnifiedUniverse observer={mouse} entropy={chaos} depth={depth} isDecoding={isDecoding} speed={mouseSpeed} />
            case 'FREQUENCY': return <FrequencyUniverse observer={mouse} entropy={chaos} isDecoding={isDecoding} />
            case 'MATRIX': return <MatrixUniverse chaos={chaos} />
            case 'MATRIX': return <MatrixUniverse chaos={chaos} />
            case 'DARK_MATTER': return <DarkMatterUniverse observer={mouse} entropy={universeState.entropy} />
            case 'NEURAL_NETWORK': return <NeuralNetworkUniverse observer={mouse} entropy={universeState.entropy} lssiData={lssiData as any} />
            case 'BIOLOGIC': return <BiologicUniverse observer={mouse} entropy={universeState.entropy} />
            case 'PERCEPTION': return <PerceptionUniverse observer={mouse} entropy={universeState.entropy} lssiData={lssiData as any} />
            case 'LEGENDRE': return <LegendresUniverse />
            case 'EPISTEMIC_WAR': return <EpistemicWarUniverse onNavigate={setViewMode} />
            case 'DUAL_MIND': return <DualMindUniverse />
            case 'DARK_FOREST': return <DarkForestUniverse />
            case 'DECODER': return (
              <UniverseDecoder
                observer={mouse}
                entropy={universeState.entropy}
                isDecoding={isDecoding}
                viewMode={viewMode}
                onNavigate={setViewMode}
                onSetEntropy={(newEntropy: number) => setUniverseState(prev => ({ ...prev, entropy: newEntropy }))}
              />
            )
            default:
              return <ThinkingUniverse clusters={manifest?.clusters || []} onClusterSelect={setSelectedCluster} chaosLevel={chaos} />
          }
        })() as any}
        <LifeSim mode={viewMode} density={lifeDensity} />
        <UniversalAgentOverlay observer={mouse} onSelectAgent={setSelectedAgent} selectedAgentId={selectedAgent?.id} />
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
          dpr={[1, 2]}
          gl={{ powerPreference: 'high-performance', antialias: false }}
          style={{ touchAction: 'none' }}
        >
          <PerspectiveCamera makeDefault position={viewMode === 'WORMHOLE' ? [0, 0, 50] : [0, 0, 60]} fov={viewMode === 'WORMHOLE' ? 70 : 60} />
          <OrbitControls makeDefault enablePan enableZoom enableRotate autoRotate={viewMode === 'OPERATOR'} />
          <ambientLight intensity={0.2} />
          <pointLight position={[20, 20, 20]} intensity={1.5} />

          <Suspense fallback={null}>
            {renderUniverse()}
            <CameraDrift />
            <InfiniteZoomManager active={isInfiniteZoom} onComplete={() => setIsInfiniteZoom(false)} />
          </Suspense>

          <EffectComposer multisampling={0}>
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

      {/* UNIVERSAL INTERFACE CONVERGENCE - PHASE 25 */}
      <UniversalHUD
        viewMode={viewMode}
        onNavigate={(m) => setViewMode(m as ViewMode)}
        universeState={universeState}
        lssiData={lssiData}
        apiStatus={apiStatus}
        eventLog={eventLog}
        interactions={interactions}
        physics={physics}
        symbiosis={symbiosis}
        onToggleSymbiosis={() => setSymbiosis(!symbiosis)}
        isDecoding={isDecoding}
        onToggleDecoder={() => setIsDecoding(!isDecoding)}
      />

      <UniverseCodex mode={viewMode} isOpen={isCodexOpen} onClose={() => setIsCodexOpen(false)} />

      {viewMode === 'GENESIS' && (
        <GenesisUI
          age={genesisAge}
          running={genesisRunning}
          setRunning={setGenesisRunning}
          viewState={genesisViewState}
          setViewState={genesisViewState}
        />
      )}

      {(viewMode === 'BINARY' || viewMode === 'MATRIX' || viewMode === 'FREQUENCY') && (
        <BinaryFrequencyUniverse equation={physics.equation} constants={physics.constants} />
      )}
      {viewMode === 'OPERATOR' && selectedCluster && <ClusterDetail cluster={selectedCluster} onClose={() => setSelectedCluster(null)} />}

      {/* Universal Agent Tracker UI */}
      {selectedAgent && (
        <AgentTrackerHUD agent={selectedAgent} onClose={() => setSelectedAgent(null)} />
      )}
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

function AgentTrackerHUD({ agent, onClose }: { agent: AgentData, onClose: () => void }) {
  return (
    <div className="absolute top-24 left-6 w-80 pointer-events-auto animate-fade-in-up z-50">
      <div className="glass-panel p-0 bg-black/80 border border-cyan-500/30 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(0,200,255,0.2)]">
        {/* Header */}
        <div className="bg-cyan-900/30 p-4 border-b border-cyan-500/30 flex justify-between items-center">
          <div>
            <h3 className="text-sm font-black text-cyan-400 tracking-widest">{agent.name}</h3>
            <p className="text-[9px] text-cyan-300/60 uppercase tracking-wider">Class: {agent.type}</p>
          </div>
          <button onClick={onClose} className="text-cyan-500 hover:text-white transition-colors">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 font-mono text-[10px]">
          <div className="flex justify-between items-center">
            <span className="text-white/40">STATUS</span>
            <span className={`font-bold ${agent.status === 'ACTIVE' ? 'text-green-400' : 'text-amber-400'}`}>{agent.status}</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-white/60">
              <span>ORBIT_RADIUS</span>
              <span className="text-cyan-300">{agent.orbitRadius.toFixed(2)} AU</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-500" style={{ width: `${(agent.orbitRadius / 60) * 100}%` }} />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-white/60">
              <span>VELOCITY</span>
              <span className="text-cyan-300">{Math.abs(agent.speed * 1000).toFixed(0)} km/s</span>
            </div>
            <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500" style={{ width: `${Math.abs(agent.speed) * 800}%` }} />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-white/10">
            <span className="text-white/40">INCLINATION</span>
            <span className="text-white">{(agent.inclination * 180 / Math.PI).toFixed(1)}°</span>
          </div>

          <div className="mt-4 p-3 bg-cyan-500/5 border border-cyan-500/20 rounded">
            <p className="text-[9px] text-cyan-400/80 leading-relaxed">
              &gt; AGENT_LOG: Monitoring sector activity. No anomalies detected in current orbital path. uplink_stable: true.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-2 border-t border-white/10 bg-white/5 flex gap-2">
          <button className="flex-1 py-2 text-[9px] font-bold text-center bg-cyan-500/10 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/20 rounded transition-all">
            TRACK
          </button>
          <button className="flex-1 py-2 text-[9px] font-bold text-center bg-purple-500/10 hover:bg-purple-500/30 text-purple-400 border border-purple-500/20 rounded transition-all">
            HAIL
          </button>
        </div>
      </div>
    </div>
  )
}
