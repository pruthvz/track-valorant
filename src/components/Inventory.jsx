import { useInventory } from '../hooks/useInventory'

export default function Inventory() {
  const { inventory, clearInventory, removeFromInventory, inventoryCount } = useInventory()

  if (inventory.length === 0) {
    return (
      <div className="min-h-screen bg-black relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex items-center justify-center min-h-screen">
          <div className="text-center py-16 bg-black/40 backdrop-blur-sm rounded-lg border-2 border-red-500/20 relative overflow-hidden w-full max-w-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
            <div className="relative z-10">
              <div className="text-8xl mb-6 filter drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">📦</div>
              <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-wider">Your Inventory is Empty</h2>
              <p className="text-gray-300 text-xl font-light mb-8">
                <span className="text-red-400 font-semibold">Open crates</span> to start collecting weapon skins!
              </p>
            </div>
          </div>
        </div>

        {/* Animated Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-red-950/20 to-black"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,0,0,0.1),transparent_50%)]"></div>
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
              MY INVENTORY
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-gray-400 text-center text-lg font-light tracking-wide">
              {inventoryCount} {inventoryCount === 1 ? 'item' : 'items'} collected
            </p>
            <button
              onClick={clearInventory}
              className="px-6 py-2 bg-black border-2 border-red-500/50 hover:border-red-500 text-white font-black text-sm uppercase tracking-[0.2em] transition-all duration-300 hover:bg-red-500/10"
            >
              CLEAR ALL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {inventory.map((item) => (
            <div
              key={item.uuid}
              className="group relative bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden border-2 border-red-500/20 hover:border-red-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:-translate-y-2"
            >
              <div className="aspect-square flex items-center justify-center p-4 bg-gradient-to-b from-black/80 to-black relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <img
                  src={item.displayIcon || item.chromas?.[0]?.displayIcon}
                  alt={item.displayName}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 relative z-10 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                  onError={(e) => {
                    e.target.style.display = 'none'
                  }}
                />
              </div>
              <div className="p-3 bg-black/80 backdrop-blur-sm border-t border-red-500/20">
                <h3 className="text-white font-bold text-sm mb-1 truncate uppercase tracking-wide">
                  {item.displayName}
                </h3>
                {item.quantity > 1 && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wide">Qty:</span>
                    <span className="text-xs font-bold text-yellow-400">{item.quantity}</span>
                  </div>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeFromInventory(item.uuid);
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg z-20"
                title="Remove from inventory"
              >
                <span className="leading-none">×</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Animated Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}

