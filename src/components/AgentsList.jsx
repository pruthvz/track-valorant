import React, { useState, useEffect } from 'react'
import { fetchAgents } from '../api/valorant'

function AgentsList() {
    const [agents, setAgents] = useState([])

    useEffect(() => {
        async function fetchAgentsData() {
            const data = await fetchAgents()
            setAgents(data)
        }
        fetchAgentsData()
    }, [])


  return (
    <div style={{ display: "flex", flexWrap: "wrap" }}>
      {agents.map((agent) => (
        <div key={agent.uuid} style={{ margin: 20 }}>
          <img 
            src={agent.displayIcon} 
            alt={agent.displayName} 
            width={120}
          />
          <h3>{agent.displayName}</h3>
        </div>
      ))}
    </div>
  )
}

export default AgentsList