import { useState, useEffect, useRef } from "react";
import { fetchWeaponSkins } from "../api/valorant";
import { playTick, playWhoosh, playReveal, playSuccess } from "../utils/sounds";

export default function CrateModal({ isOpen, onClose, onWin }) {
  const [skins, setSkins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpening, setIsOpening] = useState(false);
  const [currentSkinIndex, setCurrentSkinIndex] = useState(0);
  const [wonSkin, setWonSkin] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [targetIndex, setTargetIndex] = useState(0);
  const tickSoundInterval = useRef(null);
  const lastTickTime = useRef(0);
  const loopingTickSound = useRef(null);

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

    // Stop any existing looping tick sound
    if (loopingTickSound.current) {
      loopingTickSound.current.pause();
      loopingTickSound.current.currentTime = 0;
      loopingTickSound.current = null;
    }

    // Start looping tick sound
    loopingTickSound.current = playTick(true);

    // Reset state first
    setIsOpening(true);
    setShowResult(false);
    setWonSkin(null);
    setCurrentSkinIndex(0);
    
    const selectedTargetIndex = Math.floor(Math.random() * skins.length);
    const selectedSkin = skins[selectedTargetIndex];
    setTargetIndex(selectedTargetIndex);
    setWonSkin(selectedSkin);

    let currentIndex = 0;
    let speed = 30;
    const slowDownPoint = 2000;
    const totalDuration = 4000;
    const minSpeed = 200;

    const startTime = Date.now();
    lastTickTime.current = startTime;

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
          
          // Play whoosh sound when slowing down (occasionally)
          if (elapsed - lastTickTime.current > 300) {
            playWhoosh();
            lastTickTime.current = elapsed;
          }
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
        
        // Stop the looping tick sound
        if (loopingTickSound.current) {
          loopingTickSound.current.pause();
          loopingTickSound.current.currentTime = 0;
          loopingTickSound.current = null;
        }
        
        // Play reveal sound
        playReveal();
        
        setTimeout(() => {
          setShowResult(true);
          // Play success sound when result is shown
          playSuccess();
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
      <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-2xl font-black uppercase tracking-wider mb-4">Loading...</div>
          <div className="w-32 h-1 bg-black border border-red-500/50">
            <div className="h-full bg-red-500 animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div className="bg-black border-2 border-red-500/30 shadow-[0_0_60px_rgba(239,68,68,0.3)] max-w-7xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative" onClick={(e) => e.stopPropagation()}>
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent"></div>
        
        <div className="p-4 sm:p-6 md:p-8 relative z-10">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-500 text-2xl sm:text-3xl font-black w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center border-2 border-red-500/30 hover:border-red-500 bg-black/80 hover:bg-red-500/10 transition-all duration-300 z-20"
          >
            ×
          </button>

          <div className="text-center mb-6 sm:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-[0.2em]">
                WEAPON CRATE
              </h1>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-red-500/50 to-transparent"></div>
            </div>
          </div>

          {/* Crate Container */}
          <div className="relative">
            <div className={`relative bg-black/80 backdrop-blur-sm p-4 sm:p-6 md:p-8 border-2 ${
              showResult ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.6)]' : 'border-red-500/30'
            } transition-all duration-500`}>
              {isOpening && (
                <div className="text-center mb-4 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-red-500 uppercase tracking-[0.2em] drop-shadow-[0_0_20px_rgba(239,68,68,0.8)] animate-pulse">
                    OPENING CRATE...
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
                    
                    // Valorant-themed colors - black with red accents
                    const bgColor = slotIndex % 2 === 0 ? 'bg-black/60 border-red-500/20' : 'bg-black/80 border-red-500/30';
                    
                    return (
                      <div key={slotIndex} className="relative flex-shrink-0">
                        {slotIndex === 6 && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 z-10 -ml-0.5 sm:-ml-1.5 shadow-[0_0_20px_rgba(239,68,68,0.8)]"></div>
                        )}
                        
                        <div className={`${bgColor} border-2 w-16 h-24 sm:w-24 sm:h-32 md:w-28 md:h-40 lg:w-32 lg:h-44 xl:w-36 xl:h-48 flex flex-col items-center p-1 sm:p-1.5 md:p-2 transition-all duration-100 ${
                          isActiveSlot ? 'border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.8)] scale-110 bg-black/90' : ''
                        }`}>
                          {skin && (
                            <>
                              <div className="flex-1 flex items-center justify-center w-full min-h-0">
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
                              <div className="w-full mt-1 sm:mt-1.5 md:mt-2 min-h-[20px] sm:min-h-[24px] flex items-center justify-center">
                                <p className={`text-[7px] sm:text-[8px] md:text-[9px] lg:text-[10px] font-bold uppercase tracking-tight leading-tight text-center ${
                                  isActiveSlot && showResult
                                    ? 'text-red-400 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                                    : 'text-gray-300'
                                }`} style={{
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '100%',
                                  wordBreak: 'break-word',
                                  lineHeight: '1.1'
                                }}>
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
              <div className="mt-6 sm:mt-8 md:mt-10 text-center animate-fade-in px-2">
                <div className="inline-block bg-black/80 border-2 border-red-500 px-6 py-3 sm:px-8 sm:py-4 md:px-12 md:py-6 shadow-[0_0_40px_rgba(239,68,68,0.6)]">
                  <p className="text-red-400 font-black text-lg sm:text-xl md:text-2xl uppercase tracking-[0.2em] mb-2">
                    YOU RECEIVED
                  </p>
                  <p className="text-white font-bold text-xl sm:text-2xl md:text-3xl uppercase tracking-wide">
                    {wonSkin.displayName}
                  </p>
                </div>
              </div>
            )}

            {/* Open Crate Button */}
            {!isOpening && !showResult && (
              <div className="mt-6 sm:mt-8 flex justify-center">
                <button
                  onClick={openCrate}
                  disabled={skins.length === 0}
                  className="group relative px-12 py-4 sm:px-16 sm:py-5 bg-red-500 hover:bg-red-600 text-white font-black text-lg sm:text-xl uppercase tracking-[0.2em] border-2 border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:shadow-[0_0_60px_rgba(239,68,68,0.8)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="relative z-10">OPEN CRATE</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </div>
            )}
            
            {/* Action Buttons after result */}
            {showResult && (
              <div className="mt-6 sm:mt-8 flex justify-center gap-4 flex-wrap">
                <button
                  onClick={openCrate}
                  className="group relative px-12 py-4 sm:px-16 sm:py-5 bg-red-500 hover:bg-red-600 text-white font-black text-lg sm:text-xl uppercase tracking-[0.2em] border-2 border-red-400 shadow-[0_0_40px_rgba(239,68,68,0.6)] hover:shadow-[0_0_60px_rgba(239,68,68,0.8)] transition-all duration-300 transform hover:scale-105"
                >
                  <span className="relative z-10">OPEN ANOTHER</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={onClose}
                  className="px-12 py-4 sm:px-16 sm:py-5 bg-black border-2 border-red-500/50 hover:border-red-500 text-white font-black text-lg sm:text-xl uppercase tracking-[0.2em] transition-all duration-300 hover:bg-red-500/10"
                >
                  CLOSE
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

