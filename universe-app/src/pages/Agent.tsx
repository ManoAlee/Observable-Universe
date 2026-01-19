import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export default function Agent(){
  const { name } = useParams()
  const [md, setMd] = useState('Carregando...')
  useEffect(()=>{
    if(!name) return
    fetch(`/agents/${name}.md`).then(r=>{
      if(!r.ok) throw new Error('Not found')
      return r.text()
    }).then(setMd).catch(()=>setMd('Documento não encontrado.'))
  },[name])

  return (
    <div>
      <h1>{name?.toUpperCase()}</h1>
      <pre style={{whiteSpace:'pre-wrap'}}>{md}</pre>
    </div>
  )
}
