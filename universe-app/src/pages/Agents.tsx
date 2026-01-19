import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function Agents(){
  const [list,setList] = useState<string[]>([])
  useEffect(()=>{
    // Discover agents by fetching public/agents directory listing is not available, so hardcode
    setList(['loki','kratos'])
  },[])
  return (
    <div>
      <h1>Agentes</h1>
      <ul>
        {list.map(a=>(<li key={a}><Link to={`/agent/${a}`}>{a.toUpperCase()}</Link></li>))}
      </ul>
    </div>
  )
}
