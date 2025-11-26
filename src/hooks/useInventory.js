import { useState, useEffect, useRef } from 'react'

const STORAGE_KEY = 'valorant-inventory'

export function useInventory() {
  // Initialize from localStorage synchronously
  const [inventory, setInventory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        return Array.isArray(parsed) ? parsed : []
      }
    } catch (error) {
      console.error('Error loading inventory:', error)
    }
    return []
  })
  
  const hasLoaded = useRef(false)

  // Mark as loaded after first render
  useEffect(() => {
    hasLoaded.current = true
  }, [])

  // Save to localStorage whenever inventory changes (after initial load)
  useEffect(() => {
    if (hasLoaded.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory))
      } catch (error) {
        console.error('Error saving inventory:', error)
      }
    }
  }, [inventory])

  const addToInventory = (item) => {
    if (!item || !item.uuid) return
    
    setInventory(prev => {
      // Check if item already exists
      const exists = prev.find(i => i.uuid === item.uuid)
      if (exists) {
        // If it exists, increment quantity
        return prev.map(i => 
          i.uuid === item.uuid 
            ? { ...i, quantity: (i.quantity || 1) + 1 }
            : i
        )
      } else {
        // Add new item with timestamp
        return [...prev, { ...item, quantity: 1, obtainedAt: new Date().toISOString() }]
      }
    })
  }

  const clearInventory = () => {
    setInventory([])
    localStorage.removeItem(STORAGE_KEY)
  }

  const removeFromInventory = (uuid) => {
    setInventory(prev => prev.filter(item => item.uuid !== uuid))
  }

  return {
    inventory,
    addToInventory,
    clearInventory,
    removeFromInventory,
    inventoryCount: inventory.reduce((sum, item) => sum + (item.quantity || 1), 0)
  }
}

