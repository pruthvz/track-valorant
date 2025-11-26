import { useState, useEffect, useRef } from "react";
import { fetchWeaponSkins } from "../api/valorant";

export default function CrateOpening() {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);
  const [wonSkin, setWonSkin] = useState(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchWeaponSkins();
      // Filter out skins without display icons
      const validSkins = data.filter(skin => skin.displayIcon || skin.chromas?.[0]?.displayIcon);
      setSkins(validSkins);
      setLoading(false);
    }
    fetchData();
  }, []);

  const openCrate = () => {
    if (skins.length === 0 || isOpening) return;

    setIsOpening(true);
    setShowResult(false);
    setWonSkin(null);

    // Randomly select a skin to land on BEFORE animation starts
    const targetIndex = Math.floor(Math.random() * skins.length);
    const selectedSkin = skins[targetIndex];

    // Animation phases with swiping effect
    let currentIndex = 0;
    let speed = 30; // Start very fast
    const slowDownPoint = 2000; // Start slowing after 2 seconds
    const totalDuration = 4000; // Total animation duration
    const minSpeed = 200; // Minimum speed when fully slowed

    const startTime = Date.now();

    // Calculate how many items to show before landing on target
    // We want to go through at least 2 full cycles, then land on target
    const minCycles = 2;
    const maxCycles = 4;
    const cycles = minCycles + Math.floor(Math.random() * (maxCycles - minCycles));
    const totalItemsToPass = (cycles * skins.length) + targetIndex;
    
    let itemsPassed = 0;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < totalDuration) {
        // Gradually slow down
        if (elapsed > slowDownPoint) {
          const slowdownProgress = (elapsed - slowDownPoint) / (totalDuration - slowDownPoint);
          speed = 30 + (slowdownProgress * (minSpeed - 30));
        }

        // Calculate which index to show based on progress
        const progress = elapsed / totalDuration;
        const currentItemIndex = Math.floor(progress * totalItemsToPass);
        const displayIndex = currentItemIndex % skins.length;
        
        // In the last portion, ensure we're heading towards target
        if (progress > 0.85) {
          // We're in the final 15%, make sure we approach target naturally
          const finalProgress = (progress - 0.85) / 0.15;
          const remainingItems = totalItemsToPass - currentItemIndex;
          
          if (remainingItems <= 5) {
            // Very close to end, slow down more and approach target
            speed = Math.max(speed, minSpeed * 1.5);
          }
        }

        setCurrentSkinIndex(displayIndex);

        setTimeout(animate, Math.max(speed, 30));
      } else {
        // Animation complete - ensure we land exactly on the target
        setCurrentSkinIndex(targetIndex);
        setWonSkin(selectedSkin);
        setIsOpening(false);
        
        // Show result after a brief moment
        setTimeout(() => {
          setShowResult(true);
        }, 300);
      }
    };

    animate();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-gray-400 text-lg">Loading crate...</div>
      </div>
    );
  }

  const currentSkin = skins[currentSkinIndex] || null;
  const displaySkin = showResult && wonSkin ? wonSkin : currentSkin;

  return (
    <div className="w-full min-h-screen bg-gray-900 py-8">
      <div className="text-center mb-6 px-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wider">
          Weapon Crate #1
        </h1>
      </div>

      <div className="relative w-full overflow-x-hidden">
        {/* Crate Container - Full Width */}
        <div className="relative w-full">
          {/* Crate Design */}
          <div className={`relative bg-gray-800/95 backdrop-blur-sm rounded-lg mx-4 p-6 shadow-2xl border border-gray-700 ${
            showResult ? 'ring-2 ring-yellow-500/50' : ''
          } transition-all duration-500`}>
            {/* Opening Title */}
            {isOpening && (
              <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                  Opening Crate!
                </h2>
              </div>
            )}

            {/* Slots Container - 8 slots with alternating colors */}
            <div className="flex justify-center items-center gap-2 px-4 py-4">
              {[...Array(8)].map((_, slotIndex) => {
                // Calculate which skin to show in this slot based on current position
                // Center slots (3 and 4) show the current skin, others show adjacent skins
                const offset = slotIndex - 3.5; // Center is between slot 3 and 4
                const skinIndex = (Math.floor(currentSkinIndex) + Math.round(offset) + skins.length) % skins.length;
                const skin = skins[skinIndex];
                // Only highlight slot 4 (the center-right slot) when result is shown
                const isActiveSlot = slotIndex === 4 && !isOpening && showResult;
                
                // Alternating red and pink backgrounds (starting with red)
                const bgColor = slotIndex % 2 === 0 ? 'bg-red-500' : 'bg-pink-500';
                
                return (
                  <div key={slotIndex} className="relative">
                    {/* Vertical divider between slot 4 and 5 */}
                    {slotIndex === 4 && (
                      <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white z-10 -ml-1"></div>
                    )}
                    
                    {/* Slot */}
                    <div className={`${bgColor} rounded-lg w-28 h-36 flex flex-col items-center justify-center p-3 transition-all duration-100 ${
                      isActiveSlot ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-gray-800' : ''
                    }`}>
                      {skin && (
                        <>
                          <div className="flex-1 flex items-center justify-center w-full">
                            <img
                              src={skin.displayIcon || skin.chromas?.[0]?.displayIcon}
                              alt={skin.displayName}
                              className={`w-20 h-20 object-contain ${
                                isActiveSlot ? '' : 'opacity-80'
                              } transition-all duration-100`}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="text-center mt-2">
                            <p className={`text-xs font-semibold truncate w-full px-1 ${
                              isActiveSlot && showResult
                                ? 'text-yellow-300'
                                : 'text-white'
                            }`}>
                              {skin.displayName}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Result Message */}
        {showResult && wonSkin && (
          <div className="mt-6 text-center animate-fade-in px-4">
            <div className="inline-block bg-green-500/20 border-2 border-green-500 rounded-lg px-6 py-3">
              <p className="text-green-400 font-bold text-lg">
                You received: <span className="text-white">{wonSkin.displayName}</span>
              </p>
            </div>
          </div>
        )}

        {/* Skip Button (shown during opening) */}
        {isOpening && (
          <div className="mt-6 flex justify-center px-4">
            <button
              onClick={() => {
                // Skip animation - immediately show result
                setIsOpening(false);
                setShowResult(true);
              }}
              className="px-8 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm uppercase tracking-wider transition-all duration-300"
            >
              Skip
            </button>
          </div>
        )}

        {/* Open Crate Button */}
        {!isOpening && (
          <div className="mt-6 flex justify-center px-4">
            <button
              onClick={openCrate}
              disabled={skins.length === 0}
              className="px-12 py-3 rounded font-bold text-base uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
            >
              Open Crate
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

