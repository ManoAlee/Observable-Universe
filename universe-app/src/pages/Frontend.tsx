import React from 'react'

export default function Frontend(){
  const agents = [
    {name:'React',desc:'Component model, SSR/SSG with Next.js'},
    {name:'Vue',desc:'API reativa, Nuxt para SSR'},
    {name:'Svelte',desc:'Compilação a build-time, bundles pequenos'}
  ]
  const tools = ['TypeScript','Vite','Tailwind CSS','Storybook','Playwright','Cypress']
  return (
    <div>
      <h1>Agentes Front-end & Tecnologias</h1>
      <h3>Agentes recomendados</h3>
      <ul>{agents.map(a=>(<li key={a.name}><strong>{a.name}</strong>: {a.desc}</li>))}</ul>
      <h3>Ferramentas</h3>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{tools.map(t=>(<span key={t} style={{padding:'6px 8px',borderRadius:999,background:'#071827',color:'#94a3b8'}}>{t}</span>))}</div>
      <h3 style={{marginTop:12}}>Padrões & Boas práticas</h3>
      <ul>
        <li>Type-safe (TypeScript)</li>
        <li>Atomic Design / Design Tokens</li>
        <li>Testes end-to-end e visual regression</li>
        <li>Performance-first: SSR/SSG, caching, lazy-loading</li>
      </ul>
    </div>
  )
}
