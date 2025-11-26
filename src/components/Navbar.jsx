import valoLogo from '../assets/valo.png'

function Navbar({ activeTab, onTabChange }) {
  return (
    <nav className="bg-black/90 backdrop-blur-sm border-b border-red-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            {/* Valorant Logo */}
            <div className="flex items-center">
              <img 
                src={valoLogo} 
                alt="Valorant Logo" 
                className="h-8 w-auto"
              />
              <span className="ml-3 text-xl font-bold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
                VALORANT
              </span>
            </div>
            <span className="text-gray-500 text-xl">|</span>
            <span className="text-white font-semibold text-sm uppercase tracking-wider">
              Crate Simulator
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onTabChange('home')}
              className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'home'
                  ? 'text-white bg-red-500/20 border border-red-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onTabChange('agents')}
              className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'agents'
                  ? 'text-white bg-red-500/20 border border-red-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Agents
            </button>
       
            <button
              onClick={() => onTabChange('skins')}
              className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'skins'
                  ? 'text-white bg-red-500/20 border border-red-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Skins
            </button>
            <button
              onClick={() => onTabChange('inventory')}
              className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'inventory'
                  ? 'text-white bg-red-500/20 border border-red-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Inventory
            </button>
            <button
              onClick={() => onTabChange('maps')}
              className={`px-4 py-2 rounded text-sm font-semibold uppercase tracking-wider transition-all ${
                activeTab === 'maps'
                  ? 'text-white bg-red-500/20 border border-red-500/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Maps
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar

