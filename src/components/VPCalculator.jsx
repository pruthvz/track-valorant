import { useEffect, useState, useRef } from 'react'
import { fetchBundles, fetchCompetitiveTiers } from '../api/valorant'
import { getBundleVPCosts } from '../utils/bundleVP'

// Valorant rank names and their corresponding tier ranges
// Each rank has 3 tiers (except Radiant which is just tier 27)
const RANK_CONFIG = [
  { name: 'Iron', tierStart: 3, tierEnd: 5 },
  { name: 'Bronze', tierStart: 6, tierEnd: 8 },
  { name: 'Silver', tierStart: 9, tierEnd: 11 },
  { name: 'Gold', tierStart: 12, tierEnd: 14 },
  { name: 'Platinum', tierStart: 15, tierEnd: 17 },
  { name: 'Diamond', tierStart: 18, tierEnd: 20 },
  { name: 'Ascendant', tierStart: 21, tierEnd: 23 },
  { name: 'Immortal', tierStart: 24, tierEnd: 26 },
  { name: 'Radiant', tierStart: 27, tierEnd: 27 }
]

// Valorant Points pricing tiers (Cost, Base VP, Bonus VP, Total VP)
const VP_PRICING_TIERS = [
  { cost: 4.99, baseVP: 475, bonusVP: 0, totalVP: 475 },
  { cost: 9.99, baseVP: 950, bonusVP: 50, totalVP: 1000 },
  { cost: 19.99, baseVP: 1900, bonusVP: 150, totalVP: 2050 },
  { cost: 34.99, baseVP: 3325, bonusVP: 325, totalVP: 3650 },
  { cost: 49.99, baseVP: 4750, bonusVP: 600, totalVP: 5350 },
  { cost: 99.99, baseVP: 9500, bonusVP: 1500, totalVP: 11000 }
]

// Average account value based on rank (in USD)
// These are estimated average values for accounts at each rank tier
const RANK_ACCOUNT_VALUES = {
  'Iron': 3.7,
  'Bronze': 6,
  'Silver': 8.5,
  'Gold': 12,
  'Platinum': 18,
  'Diamond': 27.5,
  'Ascendant': 39.99,
  'Immortal': 124.5,
  'Radiant': 250    // Top-tier collection, maximum value
}

/**
 * Calculate the real money cost to purchase a given amount of VP
 * Uses the tiered pricing structure to find the optimal purchase
 * @param {number} totalVP - Total VP needed
 * @returns {Object} Object with cost, breakdown, and packages needed
 */
const calculateRealMoneyCost = (totalVP) => {
  if (totalVP <= 0) {
    return { totalCost: 0, packages: [] }
  }

  let remainingVP = totalVP
  let totalCost = 0
  const packages = []
  
  // Sort tiers by total VP (largest first) - larger packages have better value
  const sortedTiers = [...VP_PRICING_TIERS].sort((a, b) => b.totalVP - a.totalVP)

  // Greedy algorithm: buy largest packages first (best value per VP)
  for (const tier of sortedTiers) {
    if (remainingVP <= 0) break
    
    // Calculate how many of this package we can buy
    const quantity = Math.floor(remainingVP / tier.totalVP)
    
    if (quantity > 0) {
      const vpFromThisPurchase = tier.totalVP * quantity
      const costForThisPurchase = tier.cost * quantity

      packages.push({
        tier: tier,
        quantity: quantity,
        vp: vpFromThisPurchase,
        cost: costForThisPurchase
      })

      totalCost += costForThisPurchase
      remainingVP -= vpFromThisPurchase
    }
  }

  // If there's still remaining VP, find the smallest package that covers it
  if (remainingVP > 0) {
    // Sort by total VP ascending to find smallest package that covers remaining
    const ascendingTiers = [...VP_PRICING_TIERS].sort((a, b) => a.totalVP - b.totalVP)
    const coveringTier = ascendingTiers.find(tier => tier.totalVP >= remainingVP) || ascendingTiers[ascendingTiers.length - 1]
    
    packages.push({
      tier: coveringTier,
      quantity: 1,
      vp: coveringTier.totalVP,
      cost: coveringTier.cost
    })
    totalCost += coveringTier.cost
  }

  return {
    totalCost: parseFloat(totalCost.toFixed(2)),
    packages
  }
}

/**
 * Calculate approximate USD cost for a given VP amount
 * Uses the best value tier rate for estimation
 * @param {number} vpAmount - Amount of VP
 * @returns {number} Approximate USD cost
 */
const estimateUSDCost = (vpAmount) => {
  if (vpAmount <= 0) return 0
  
  // Use the best value tier ($99.99 for 11000 VP) as the base rate
  const bestValueRate = 99.99 / 11000 // ~0.00909 per VP
  return parseFloat((vpAmount * bestValueRate).toFixed(2))
}

export default function VPCalculator() {
  const [bundles, setBundles] = useState([])
  const [filteredBundles, setFilteredBundles] = useState([])
  const [competitiveTiers, setCompetitiveTiers] = useState([])
  const [ranks, setRanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRank, setSelectedRank] = useState(null)
  const [selectedBundles, setSelectedBundles] = useState([])
  const [totalVP, setTotalVP] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [bundleVPCosts, setBundleVPCosts] = useState({})
  const [loadedImages, setLoadedImages] = useState(new Set())
  const resultsRef = useRef(null)

  useEffect(() => {
    async function fetchData() {
      const [bundlesData, tiersData] = await Promise.all([
        fetchBundles(),
        fetchCompetitiveTiers()
      ])
      
      // Filter bundles that have display icons
      const validBundles = bundlesData.filter(bundle => bundle.displayIcon || bundle.logoIcon)
      
      // Preload first 20 images for faster initial display
      const imagesToPreload = validBundles.slice(0, 20)
      imagesToPreload.forEach(bundle => {
        const img = new Image()
        img.src = bundle.displayIcon || bundle.logoIcon
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, bundle.uuid]))
        }
      })
      
      setBundles(validBundles)
      setFilteredBundles(validBundles)
      
      // Process competitive tiers
      if (tiersData && tiersData.length > 0) {
        // Get the latest competitive tier set (usually the last one)
        const latestTierSet = tiersData[tiersData.length - 1]
        setCompetitiveTiers(latestTierSet.tiers || [])
        
        // Map ranks to their tier icons
        const mappedRanks = RANK_CONFIG.map(rankConfig => {
          // Get the middle tier for each rank (or the single tier for Radiant)
          const tierNumber = rankConfig.tierStart === rankConfig.tierEnd 
            ? rankConfig.tierStart 
            : Math.floor((rankConfig.tierStart + rankConfig.tierEnd) / 2)
          
          const tierData = latestTierSet.tiers?.find(t => t.tier === tierNumber)
          
          return {
            name: rankConfig.name,
            tier: tierNumber,
            icon: tierData?.smallIcon || tierData?.largeIcon || null,
            tierName: tierData?.tierName || rankConfig.name
          }
        })
        
        setRanks(mappedRanks)
      }
      
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    let filtered = bundles
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      filtered = bundles.filter(bundle =>
        bundle.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    
    // Sort: selected bundles first, then unselected
    const sorted = [...filtered].sort((a, b) => {
      const aSelected = selectedBundles.some(bundle => bundle.uuid === a.uuid)
      const bSelected = selectedBundles.some(bundle => bundle.uuid === b.uuid)
      
      if (aSelected && !bSelected) return -1
      if (!aSelected && bSelected) return 1
      return 0
    })
    
    setFilteredBundles(sorted)
  }, [searchQuery, bundles, selectedBundles])

  const toggleBundleSelection = (bundle) => {
    setSelectedBundles(prev => {
      const isSelected = prev.some(b => b.uuid === bundle.uuid)
      if (isSelected) {
        return prev.filter(b => b.uuid !== bundle.uuid)
      } else {
        return [...prev, bundle]
      }
    })
  }

  const calculateTotal = () => {
    if (selectedBundles.length === 0) return
    
    // Get bundle names
    const bundleNames = selectedBundles.map(bundle => bundle.displayName)
    
    // Get VP costs from JSON mapping
    const vpCosts = getBundleVPCosts(bundleNames)
    
    // Store the VP costs
    setBundleVPCosts(vpCosts)
    
    // Calculate total VP
    const total = selectedBundles.reduce((sum, bundle) => {
      const vpCost = vpCosts[bundle.displayName] || 7100
      return sum + vpCost
    }, 0)
    
    setTotalVP(total)
    setShowResults(true)
    
    // Scroll to results after a brief delay to ensure DOM update
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    }, 100)
  }

  // Get rank account value
  const getRankAccountValue = () => {
    if (!selectedRank) return 0
    return RANK_ACCOUNT_VALUES[selectedRank.name] || 0
  }

  const resetCalculator = () => {
    setSelectedBundles([])
    setTotalVP(0)
    setShowResults(false)
    setSelectedRank(null)
    setSearchQuery('')
    setBundleVPCosts({})
  }

  // Calculate real money cost using tiered pricing
  const moneyCalculation = totalVP > 0 ? calculateRealMoneyCost(totalVP) : { totalCost: 0, packages: [] }
  const bundleUSD = parseFloat(moneyCalculation.totalCost.toFixed(2))
  const rankAccountValue = getRankAccountValue()
  const totalUSD = (bundleUSD + rankAccountValue).toFixed(2)

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-black uppercase tracking-wider mb-4">Loading Bundles...</div>
          <div className="w-32 h-1 bg-black border border-red-500/50">
            <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
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
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
            <h2 className="text-4xl sm:text-5xl font-black text-white uppercase tracking-wider">
              VP CALCULATOR
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
          </div>
          <p className="text-gray-400 text-center text-lg font-light tracking-wide">
            Calculate the total value of your Valorant account
          </p>
        </div>

        {/* Rank Selection */}
        <div className="mb-10">
          <h3 className="text-2xl font-bold text-white mb-4 uppercase tracking-wide">Select Your Rank</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3">
            {ranks.length > 0 ? (
              ranks.map((rank) => (
                <button
                  key={rank.name}
                  onClick={() => setSelectedRank(rank)}
                  className={`relative p-4 rounded-lg border-2 transition-all duration-300 ${
                    selectedRank?.name === rank.name
                      ? 'border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-105'
                      : 'border-gray-700 bg-black/40 hover:border-gray-500 hover:bg-gray-900/40'
                  }`}
                >
                  <div className="w-full h-16 rounded bg-gradient-to-b from-black/80 to-black flex items-center justify-center mb-2 overflow-hidden">
                    {rank.icon ? (
                      <img
                        src={rank.icon}
                        alt={rank.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          // Fallback to text if image fails
                          e.target.style.display = 'none'
                          const parent = e.target.parentElement
                          if (parent && !parent.querySelector('.fallback-text')) {
                            const fallback = document.createElement('span')
                            fallback.className = 'fallback-text text-white font-black text-xs uppercase tracking-wider'
                            fallback.textContent = rank.name.charAt(0)
                            parent.appendChild(fallback)
                          }
                        }}
                      />
                    ) : (
                      <span className="text-white font-black text-xs uppercase tracking-wider drop-shadow-lg">
                        {rank.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <p className="text-white text-xs font-semibold uppercase text-center">{rank.name}</p>
                  {selectedRank?.name === rank.name && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-400">
                Loading ranks...
              </div>
            )}
          </div>
        </div>

        {/* Bundle Search and Selection */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <h3 className="text-2xl font-bold text-white uppercase tracking-wide">
              Select Bundles ({selectedBundles.length} selected)
            </h3>
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search bundles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border-2 border-red-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-all"
              />
              <svg
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 max-h-96 overflow-y-auto p-2 custom-scrollbar">
            {filteredBundles.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-400">
                No bundles found matching your search.
              </div>
            ) : (
              filteredBundles.map((bundle) => {
                const isSelected = selectedBundles.some(b => b.uuid === bundle.uuid)
                return (
                  <button
                    key={bundle.uuid}
                    onClick={() => toggleBundleSelection(bundle)}
                    className={`relative group p-3 rounded-lg border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-red-500 bg-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                        : 'border-gray-700 bg-black/40 hover:border-gray-500 hover:bg-gray-900/40'
                    }`}
                  >
                    <div className="aspect-square flex items-center justify-center mb-2 bg-gradient-to-b from-black/80 to-black rounded overflow-hidden relative">
                      {!loadedImages.has(bundle.uuid) && (
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-800/50 to-gray-900/50 animate-pulse flex items-center justify-center">
                          <div className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin"></div>
                        </div>
                      )}
                      <img
                        src={bundle.displayIcon || bundle.logoIcon}
                        alt={bundle.displayName}
                        className={`w-full h-full object-contain p-2 transition-opacity duration-300 ${
                          loadedImages.has(bundle.uuid) ? 'opacity-100' : 'opacity-0'
                        }`}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => {
                          setLoadedImages(prev => new Set([...prev, bundle.uuid]))
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none'
                          setLoadedImages(prev => new Set([...prev, bundle.uuid]))
                        }}
                      />
                    </div>
                    <p className="text-white text-xs font-semibold uppercase text-center truncate w-full">
                      {bundle.displayName}
                    </p>
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <button
            onClick={calculateTotal}
            disabled={selectedBundles.length === 0}
            className={`px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-black text-lg uppercase tracking-wider border-2 border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.6)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${
              selectedBundles.length > 0 ? 'hover:shadow-[0_0_60px_rgba(239,68,68,0.8)]' : ''
            }`}
          >
            Calculate Total
          </button>
          <button
            onClick={resetCalculator}
            className="px-8 py-4 bg-black border-2 border-gray-700 hover:border-gray-500 text-white font-black text-lg uppercase tracking-wider transition-all duration-300 hover:bg-gray-900/40"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        {showResults && (
          <div 
            ref={resultsRef}
            className="bg-black/60 backdrop-blur-sm rounded-lg border-2 border-red-500/30 p-6 sm:p-8 relative overflow-hidden animate-fade-in"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
            <div className="relative z-10">
              {/* Account Value Header - Prominent */}
              <div className="mb-8">
                <h3 className="text-3xl sm:text-4xl font-black text-white mb-6 uppercase tracking-wider text-center">
                  Account Value
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="text-center p-5 sm:p-6 bg-gradient-to-br from-black/60 to-black/40 rounded-lg border-2 border-red-500/30 hover:border-red-500/50 transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                    <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2">Selected Bundles</p>
                    <p className="text-white text-2xl sm:text-3xl font-black">{selectedBundles.length}</p>
                  </div>
                  <div className="text-center p-5 sm:p-6 bg-gradient-to-br from-black/60 to-black/40 rounded-lg border-2 border-yellow-500/30 hover:border-yellow-500/50 transition-all shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                    <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2">Total VP</p>
                    <p className="text-yellow-400 text-2xl sm:text-3xl font-black">{totalVP.toLocaleString()}</p>
                  </div>
                  {selectedRank && rankAccountValue > 0 && (
                    <div className="text-center p-5 sm:p-6 bg-gradient-to-br from-black/60 to-black/40 rounded-lg border-2 border-blue-500/30 hover:border-blue-500/50 transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)]">
                      <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2">Rank Value</p>
                      <p className="text-blue-400 text-2xl sm:text-3xl font-black">${rankAccountValue.toFixed(2)}</p>
                      <p className="text-gray-500 text-xs mt-1 uppercase">{selectedRank.name}</p>
                    </div>
                  )}
                  <div className="text-center p-5 sm:p-6 bg-gradient-to-br from-black/60 to-black/40 rounded-lg border-2 border-green-500/30 hover:border-green-500/50 transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                    <p className="text-gray-400 text-xs sm:text-sm uppercase tracking-wide mb-2">Total Account Value</p>
                    <p className="text-green-400 text-2xl sm:text-3xl font-black">${totalUSD}</p>
                    {selectedRank && rankAccountValue > 0 && (
                      <p className="text-gray-500 text-xs mt-1">
                        ${bundleUSD.toFixed(2)} bundles + ${rankAccountValue.toFixed(2)} rank
                      </p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Purchase Breakdown */}
              {moneyCalculation.packages.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                    <h4 className="text-xl font-bold text-white uppercase tracking-wide">
                      Recommended Purchase
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {moneyCalculation.packages.map((pkg, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-900/20 rounded-lg flex items-center justify-center flex-shrink-0 border border-red-500/30">
                            <span className="text-red-400 font-black text-lg">V</span>
                          </div>
                          <div>
                            <p className="text-white font-semibold text-sm uppercase tracking-wide">
                              {pkg.quantity > 1 ? `${pkg.quantity}x ` : ''}${pkg.tier.totalVP.toLocaleString()} VP Package
                            </p>
                            <p className="text-gray-400 text-xs">
                              {pkg.tier.baseVP.toLocaleString()} VP + {pkg.tier.bonusVP.toLocaleString()} Bonus
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          <div className="text-right">
                            <p className="text-yellow-400 font-bold">${pkg.cost.toFixed(2)}</p>
                            <p className="text-gray-400 text-xs">{pkg.vp.toLocaleString()} VP</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Bundle Breakdown */}
              {selectedBundles.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
                    <h4 className="text-xl font-bold text-white uppercase tracking-wide">
                      Bundle Breakdown
                    </h4>
                    <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
                  </div>
                  <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
                    {selectedBundles.map((bundle) => {
                      const vpCost = bundleVPCosts[bundle.displayName] || 7100
                      const usdCost = estimateUSDCost(vpCost)
                      return (
                        <div
                          key={bundle.uuid}
                          className="flex items-center justify-between p-4 bg-black/40 rounded-lg border border-red-500/20 hover:border-red-500/40 transition-all"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {bundle.displayIcon || bundle.logoIcon ? (
                              <img
                                src={bundle.displayIcon || bundle.logoIcon}
                                alt={bundle.displayName}
                                className="w-12 h-12 object-contain flex-shrink-0 rounded border border-red-500/20"
                                loading="lazy"
                                decoding="async"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-red-500/10 to-red-900/10 rounded flex items-center justify-center flex-shrink-0 border border-red-500/20">
                                <span className="text-red-400 font-black text-xs">?</span>
                              </div>
                            )}
                            <p className="text-white font-semibold text-sm uppercase tracking-wide truncate">
                              {bundle.displayName}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="text-right">
                              <p className="text-yellow-400 font-bold">{vpCost.toLocaleString()} VP</p>
                              <p className="text-gray-400 text-xs">${usdCost}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {selectedRank && (
                <div className="mt-6 text-center">
                  <p className="text-gray-400 text-sm uppercase tracking-wide mb-2">Current Rank</p>
                  <div className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-black/40 border border-red-500/30">
                    {selectedRank.icon && (
                      <img
                        src={selectedRank.icon}
                        alt={selectedRank.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    )}
                    <span className="text-white font-black text-lg uppercase">{selectedRank.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Animated Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>
    </div>
  )
}

