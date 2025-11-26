import { useState } from 'react'
import AgentsList from './components/AgentsList'
import WeaponSkinsList from './components/WeaponSkinsList'
import Inventory from './components/Inventory'
import CrateModal from './components/CrateModal'
import LandingPage from './components/LandingPage'
import Navbar from './components/Navbar'
import { useInventory } from './hooks/useInventory'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isCrateModalOpen, setIsCrateModalOpen] = useState(false)
  const { inventory, addToInventory, clearInventory, removeFromInventory, inventoryCount } = useInventory()

  return (
    <div className="min-h-screen bg-gray-900 relative">
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />
      <main>
        {activeTab === 'home' && (
          <LandingPage 
            onOpenCrate={() => setIsCrateModalOpen(true)}
            inventory={inventory}
            inventoryCount={inventoryCount}
            removeFromInventory={removeFromInventory}
          />
        )}
        {activeTab === 'agents' && <AgentsList />}
        {activeTab === 'skins' && <WeaponSkinsList />}
        {activeTab === 'inventory' && <Inventory />}
        {activeTab === 'maps' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-gray-400">
              <p className="text-lg">Maps coming soon...</p>
            </div>
          </div>
        )}
      </main>
      <CrateModal 
        isOpen={isCrateModalOpen} 
        onClose={() => setIsCrateModalOpen(false)}
        onWin={addToInventory}
      />
    </div>
  )
}

export default App

