import { useEffect, useState, useMemo } from "react";
import { fetchWeaponSkins } from "../api/valorant";

// Known weapon types in Valorant
const WEAPON_TYPES = [
  'All',
  'Classic',
  'Shorty',
  'Frenzy',
  'Ghost',
  'Sheriff',
  'Stinger',
  'Spectre',
  'Bulldog',
  'Guardian',
  'Phantom',
  'Vandal',
  'Marshal',
  'Operator',
  'Bucky',
  'Judge',
  'Ares',
  'Odin',
  'Melee',
  'Knife'
];

// Extract weapon type from skin name
const extractWeaponType = (skinName) => {
  if (!skinName) return 'Unknown';
  
  const name = skinName.toLowerCase();
  
  // Check for melee/knife first
  if (name.includes('knife') || name.includes('melee') || name.includes('tactical knife')) {
    return 'Melee';
  }
  
  // Check each weapon type
  for (const weapon of WEAPON_TYPES.slice(1)) { // Skip 'All'
    if (name.includes(weapon.toLowerCase())) {
      return weapon;
    }
  }
  
  return 'Unknown';
};

export default function WeaponSkinsList() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWeaponType, setSelectedWeaponType] = useState('All');

  useEffect(() => {
    async function fetchData() {
      const data = await fetchWeaponSkins();
      // Add weapon type to each skin
      const skinsWithType = data.map(skin => ({
        ...skin,
        weaponType: extractWeaponType(skin.displayName)
      }));
      setSkins(skinsWithType);
      setLoading(false);
    }
    fetchData();
  }, []);

  // Filter and sort skins
  const filteredSkins = useMemo(() => {
    let filtered = [...skins];

    // Filter by weapon type
    if (selectedWeaponType !== 'All') {
      filtered = filtered.filter(skin => skin.weaponType === selectedWeaponType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(skin =>
        skin.displayName.toLowerCase().includes(query) ||
        skin.weaponType.toLowerCase().includes(query)
      );
    }

    // Sort by weapon type, then by name
    filtered.sort((a, b) => {
      if (a.weaponType !== b.weaponType) {
        return a.weaponType.localeCompare(b.weaponType);
      }
      return a.displayName.localeCompare(b.displayName);
    });

    return filtered;
  }, [skins, searchQuery, selectedWeaponType]);

  // Get unique weapon types from actual skins
  const availableWeaponTypes = useMemo(() => {
    const types = new Set(skins.map(skin => skin.weaponType));
    const sortedTypes = Array.from(types).sort();
    return ['All', ...sortedTypes];
  }, [skins]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black relative flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-black uppercase tracking-wider mb-4">Loading Weapon Skins...</div>
          <div className="w-32 h-1 bg-black border border-red-500/50">
            <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
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
              WEAPON SKINS
            </h2>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
          </div>
          <p className="text-gray-400 text-center text-lg font-light tracking-wide">
            Browse all available weapon skins
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Search skins..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 bg-black/60 border-2 border-red-500/30 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 font-semibold uppercase tracking-wide"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors text-xl font-bold"
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Weapon Type Filter */}
          <div className="sm:w-64">
            <select
              value={selectedWeaponType}
              onChange={(e) => setSelectedWeaponType(e.target.value)}
              className="w-full px-4 py-3 bg-black/60 border-2 border-red-500/30 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-300 font-semibold uppercase tracking-wide cursor-pointer"
            >
              {availableWeaponTypes.map((type) => (
                <option key={type} value={type} className="bg-black">
                  {type === 'All' ? 'All Weapons' : type}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-400 text-sm uppercase tracking-wide">
            Showing <span className="text-red-400 font-bold">{filteredSkins.length}</span> of <span className="text-red-400 font-bold">{skins.length}</span> skins
          </p>
        </div>
        
        {/* Skins Grid */}
        {filteredSkins.length === 0 ? (
          <div className="text-center py-16 bg-black/40 backdrop-blur-sm rounded-lg border-2 border-red-500/20">
            <p className="text-gray-300 text-xl font-light">
              No skins found matching your search.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
            {filteredSkins.map((skin) => (
              <div
                key={skin.uuid}
                className="group relative bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden border-2 border-red-500/20 hover:border-red-500 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:-translate-y-2 cursor-pointer"
              >
                <div className="aspect-square flex items-center justify-center p-4 bg-gradient-to-b from-black/80 to-black relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <img
                    src={skin.displayIcon || skin.chromas?.[0]?.displayIcon}
                    alt={skin.displayName}
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 relative z-10 filter drop-shadow-[0_0_20px_rgba(0,0,0,0.8)]"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
                <div className="p-3 bg-black/80 backdrop-blur-sm border-t border-red-500/20">
                  <h3 className="text-white font-bold text-sm mb-1 truncate uppercase tracking-wide">
                    {skin.displayName}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-red-400 uppercase tracking-wide font-semibold">
                      {skin.weaponType}
                    </span>
                    {skin.contentTierUuid && (
                      <span className="text-xs text-gray-400 uppercase tracking-wide">
                        {skin.themeUuid ? 'Themed' : 'Standard'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Animated Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}

