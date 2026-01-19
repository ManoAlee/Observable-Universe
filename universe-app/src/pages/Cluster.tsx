import React from 'react'
import { useParams } from 'react-router-dom'

export default function Cluster({manifest}:{manifest:any}){
  const { id } = useParams();
  const cluster = manifest?.clusters?.find((c:any)=>c.id===id)
  if(!cluster) return <div><h2>Cluster não encontrado</h2></div>
  return (
    <div>
      <h1>{cluster.name} <small style={{color:'#94a3b8'}}>({cluster.root})</small></h1>
      <p><strong>Foco:</strong> {(cluster.focus||[]).join(', ')}</p>
      <h3>Tecnologias</h3>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {cluster.technologies ? Object.values(cluster.technologies).flat().map((t:any,i:number)=>(
          <span key={i} style={{padding:'6px 8px',borderRadius:999,background:'#071827',color:'#94a3b8'}}>{t}</span>
        )): <em>—</em>}
      </div>
      <pre style={{marginTop:12}}>{JSON.stringify(cluster,null,2)}</pre>
    </div>
  )
}
