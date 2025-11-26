import { useState, useEffect } from "react";
import { fetchWeaponSkins } from "../api/valorant";

export default function CrateModal({ isOpen, onClose, onWin }) {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);
  const [wonSkin, setWonSkin] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);

  useEffect(() => {
    async function fetchData() {
      const data = await fetchWeaponSkins();
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
    
    const selectedTargetIndex = Math.floor(Math.random() * skins.length);
    const selectedSkin = skins[selectedTargetIndex];
    setTargetIndex(selectedTargetIndex);
    setWonSkin(selectedSkin); // Store it immediately so skip button can use it

    let currentIndex = 0;
    let speed = 30;
    const slowDownPoint = 2000;
    const totalDuration = 4000;
    const minSpeed = 200;

    const startTime = Date.now();

    const minCycles = 2;
    const maxCycles = 4;
    const cycles = minCycles + Math.floor(Math.random() * (maxCycles - minCycles));
    const totalItemsToPass = (cycles * skins.length) + targetIndex;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      
      if (elapsed < totalDuration) {
        if (elapsed > slowDownPoint) {
          const slowdownProgress = (elapsed - slowDownPoint) / (totalDuration - slowDownPoint);
          speed = 30 + (slowdownProgress * (minSpeed - 30));
        }

        const progress = elapsed / totalDuration;
        const currentItemIndex = Math.floor(progress * totalItemsToPass);
        const displayIndex = currentItemIndex % skins.length;
        
        if (progress > 0.85) {
          const remainingItems = totalItemsToPass - currentItemIndex;
          if (remainingItems <= 5) {
            speed = Math.max(speed, minSpeed * 1.5);
          }
        }

        setCurrentSkinIndex(displayIndex);
        setTimeout(animate, Math.max(speed, 30));
      } else {
        setCurrentSkinIndex(selectedTargetIndex);
        setIsOpening(false);
        
        setTimeout(() => {
          setShowResult(true);
          // Add to inventory when result is shown
          if (onWin) {
            onWin(selectedSkin);
          }
        }, 300);
      }
    };

    animate();
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-gray-400 text-lg">Loading crate...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-gray-900 rounded-lg sm:rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 sm:p-6 md:p-8 relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 text-xl sm:text-2xl font-bold w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-800 transition-colors z-10"
          >
            ×
          </button>

          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 uppercase tracking-wider">
              Weapon Crate #1
            </h1>
          </div>

          {/* Crate Container */}
          <div className="relative">
            <div className={`relative bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 sm:p-6 md:p-8 shadow-2xl border border-gray-700 ${
              showResult ? 'ring-2 ring-yellow-500/50' : ''
            } transition-all duration-500`}>
              {isOpening && (
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white uppercase tracking-wider">
                    Opening Crate!
                  </h2>
                </div>
              )}

              {/* Slots Container - Wider to fit more weapons, no scrollbar */}
              <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <div className="flex justify-center items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 py-4 sm:py-6">
                  {[...Array(12)].map((_, slotIndex) => {
                    // Center is at slot 6 (index 6), so offset from center
                    const offset = slotIndex - 6;
                    const skinIndex = (currentSkinIndex + offset + skins.length) % skins.length;
                    const skin = skins[skinIndex];
                    // Only highlight slot 6 if it contains the won skin
                    const isActiveSlot = slotIndex === 6 && !isOpening && showResult && wonSkin && skin && skin.uuid === wonSkin.uuid;
                    
                    // Darker, more professional colors - alternating dark gray tones
                    const bgColor = slotIndex % 2 === 0 ? 'bg-gray-700' : 'bg-gray-800';
                    
                    return (
                      <div key={slotIndex} className="relative flex-shrink-0">
                        {slotIndex === 6 && (
                          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-white z-10 -ml-0.5 sm:-ml-1.5"></div>
                        )}
                        
                        <div className={`${bgColor} rounded-lg w-16 h-24 sm:w-24 sm:h-32 md:w-28 md:h-40 lg:w-32 lg:h-44 xl:w-36 xl:h-48 flex flex-col items-center justify-center p-1.5 sm:p-2 md:p-3 transition-all duration-100 ${
                          isActiveSlot ? 'ring-2 sm:ring-4 ring-yellow-400 ring-offset-1 sm:ring-offset-2 md:ring-offset-4 ring-offset-gray-800 scale-105' : ''
                        }`}>
                          {skin && (
                            <>
                              <div className="flex-1 flex items-center justify-center w-full">
                                <img
                                  src={skin.displayIcon || skin.chromas?.[0]?.displayIcon}
                                  alt={skin.displayName}
                                  className={`w-10 h-10 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 object-contain ${
                                    isActiveSlot ? '' : 'opacity-80'
                                  } transition-all duration-100`}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                              <div className="text-center mt-1 sm:mt-1.5 md:mt-2">
                                <p className={`text-[10px] sm:text-xs md:text-sm font-semibold truncate w-full px-0.5 sm:px-1 ${
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
              <div className="mt-4 sm:mt-6 md:mt-8 text-center animate-fade-in px-2">
                <div className="inline-block bg-green-500/20 border-2 border-green-500 rounded-lg px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4">
                  <p className="text-green-400 font-bold text-base sm:text-lg md:text-xl">
                    You received: <span className="text-white">{wonSkin.displayName}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Skip Button */}
            {isOpening && (
              <div className="mt-4 sm:mt-6 flex justify-center">
                <button
                  onClick={() => {
                    setIsOpening(false);
                    setCurrentSkinIndex(targetIndex);
                    setShowResult(true);
                    // Add to inventory when skipped
                    if (onWin && wonSkin) {
                      onWin(wonSkin);
                    }
                  }}
                  className="px-6 py-2 sm:px-8 sm:py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300"
                >
                  Skip
                </button>
              </div>
            )}

            {/* Open Crate Button */}
            {!isOpening && (
              <div className="mt-4 sm:mt-6 flex justify-center">
                <button
                  onClick={openCrate}
                  disabled={skins.length === 0}
                  className="px-8 py-2 sm:px-10 sm:py-2.5 md:px-12 md:py-3 rounded font-bold text-sm sm:text-base uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50"
                >
                  Open Crate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

