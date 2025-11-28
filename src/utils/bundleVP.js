import bundleVPMapping from '../data/bundle-vp-simple.json'

/**
 * Get VP cost for a bundle by name
 * @param {string} bundleName - The display name of the bundle
 * @returns {number} VP cost (defaults to 7100 if not found or null)
 */
export const getBundleVPCost = (bundleName) => {
  const cost = bundleVPMapping[bundleName]
  // Handle null values - use default if null or undefined
  return cost !== null && cost !== undefined ? cost : 7100
}

/**
 * Get VP costs for multiple bundles
 * @param {Array<string>} bundleNames - Array of bundle display names
 * @returns {Object} Object mapping bundle names to VP costs
 */
export const getBundleVPCosts = (bundleNames) => {
  const costs = {}
  bundleNames.forEach(name => {
    costs[name] = getBundleVPCost(name)
  })
  return costs
}

/**
 * Get all bundle VP mappings
 * @returns {Object} Complete mapping of bundle names to VP costs
 */
export const getAllBundleVPCosts = () => {
  return { ...bundleVPMapping }
}

