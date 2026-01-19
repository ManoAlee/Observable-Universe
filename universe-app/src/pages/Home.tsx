import React, { useState } from 'react'
import UniverseScene from '../components/UniverseScene'

export default function Home({manifest}:{manifest:any}){
  const [bloom, setBloom] = useState(0.7)
  const [speed, setSpeed] = useState(1.0)
  return (
    <div>
      <h1>Visão Geral</h1>
      <p><strong>Universo:</strong> {manifest?.universe || 'Carregando...'}</p>
      <p><strong>Princípios:</strong> reversibilidade, conservação de informação, sincronização global.</p>
      <h3>Boot sequence</h3>
      <pre>{manifest?.boot_sequence?.join('\n') || '—'}</pre>

      <h2 style={{marginTop:24}}>Visualização do Universo</h2>
      <div style={{display:'flex',gap:12,alignItems:'center'}}>
        <label style={{color:'#94a3b8'}}>Bloom: <input type="range" min="0" max="2" step="0.01" value={bloom} onChange={e=>setBloom(Number(e.target.value))} /></label>
        <label style={{color:'#94a3b8'}}>Speed: <input type="range" min="0" max="3" step="0.05" value={speed} onChange={e=>setSpeed(Number(e.target.value))} /></label>
      </div>
      <UniverseScene bloomStrength={bloom} speed={speed} />
    </div>
  )
}
