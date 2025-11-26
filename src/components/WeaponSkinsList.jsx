import { useEffect, useState } from "react";
import { fetchWeaponSkins } from "../api/valorant";

export default function WeaponSkinsList() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchWeaponSkins();
      setSkins(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="text-gray-400 text-lg">Loading weapon skins...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Weapon Skins</h2>
        <p className="text-gray-400">Browse all available weapon skins</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {skins.map((skin) => (
          <div
            key={skin.uuid}
            className="group relative bg-gray-800 rounded-lg overflow-hidden border-2 border-gray-700 hover:border-red-500 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 hover:-translate-y-1 cursor-pointer"
          >
            <div className="aspect-square flex items-center justify-center p-4 bg-gradient-to-b from-gray-800 to-gray-900">
              <img
                src={skin.displayIcon || skin.chromas?.[0]?.displayIcon}
                alt={skin.displayName}
                className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="p-3 bg-gray-800">
              <h3 className="text-white font-semibold text-sm mb-1 truncate">
                {skin.displayName}
              </h3>
              {skin.contentTierUuid && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400">
                    {skin.themeUuid ? 'Themed' : 'Standard'}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

