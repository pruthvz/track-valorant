import { useState } from 'react'
import './App.css'
import AgentsList from './components/AgentsList'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Valorant App</h1>
        <AgentsList />
      </header>
    </div>
  )
}

export default App

