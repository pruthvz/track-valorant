import { useInventory } from '../hooks/useInventory'

export default function Inventory() {
  const { inventory, clearInventory, removeFromInventory, inventoryCount } = useInventory()

  if (inventory.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-3xl font-bold text-white mb-4">Your Inventory is Empty</h2>
          <p className="text-gray-400 text-lg mb-8">
            Open crates to start collecting weapon skins!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Inventory</h2>
          <p className="text-gray-400">
            {inventoryCount} {inventoryCount === 1 ? 'item' : 'items'} collected
          </p>
        </div>
        <button
          onClick={clearInventory}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {inventory.map((item) => (
          <div
            key={item.uuid}
            className="group relative bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1"
          >
            <div className="aspect-square flex items-center justify-center p-4 bg-gradient-to-b from-gray-800 to-gray-900">
              <img
                src={item.displayIcon || item.chromas?.[0]?.displayIcon}
                alt={item.displayName}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
            <div className="p-3 bg-gray-800">
              <h3 className="text-white font-semibold text-sm mb-1 truncate">
                {item.displayName}
              </h3>
              {item.quantity > 1 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Quantity:</span>
                  <span className="text-xs font-bold text-yellow-400">{item.quantity}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => removeFromInventory(item.uuid)}
              className="absolute top-2 right-2 w-6 h-6 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove from inventory"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

