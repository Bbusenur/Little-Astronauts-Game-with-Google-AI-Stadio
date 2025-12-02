import React, { useEffect, useState } from 'react';
import { useGame, PLANET_INTROS } from './GameContext';
import { PlanetId, CharacterId } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Palette, Sparkles } from 'lucide-react';

// --- Photorealistic Planet Visuals ---
const PlanetVisual: React.FC<{ id: PlanetId, color: string, unlocked: boolean }> = ({ id, color, unlocked }) => {
    // 3D Sphere shading (lighting from top-left)
    const sphereShading = "inset -6px -6px 12px rgba(0,0,0,0.6), inset 4px 4px 12px rgba(255,255,255,0.3)";
    const atmosphereGlow = (color: string) => `0 0 20px ${color}80`; // 50% opacity hex
    
    // Locked planets are grayscale and dimmer
    const styleFilter = unlocked ? 'none' : 'grayscale(100%) brightness(0.6)';

    const renderPlanet = () => {
        switch (id) {
            case PlanetId.MERCURY:
                return (
                    <div className="w-full h-full rounded-full overflow-hidden relative" style={{ background: 'radial-gradient(circle at 30% 30%, #e5e5e5, #a3a3a3, #525252)', boxShadow: sphereShading }}>
                         {/* Craters */}
                         <div className="absolute top-[20%] left-[25%] w-[15%] h-[15%] bg-black/10 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]"></div>
                         <div className="absolute bottom-[30%] right-[20%] w-[20%] h-[20%] bg-black/15 rounded-full shadow-[inset_1px_1px_3px_rgba(0,0,0,0.5)]"></div>
                         <div className="absolute top-[50%] left-[10%] w-[10%] h-[10%] bg-black/10 rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.5)]"></div>
                    </div>
                );
            case PlanetId.VENUS:
                return (
                    <div className="w-full h-full rounded-full relative" style={{ background: 'radial-gradient(circle at 30% 30%, #fde047, #d97706, #7c2d12)', boxShadow: `${sphereShading}, ${unlocked ? '0 0 15px rgba(253, 224, 71, 0.5)' : ''}` }}>
                         {/* Swirling Clouds */}
                         <div className="absolute inset-0 rounded-full opacity-40 bg-[linear-gradient(45deg,transparent,rgba(255,255,255,0.3),transparent)] blur-[1px]"></div>
                    </div>
                );
            case PlanetId.EARTH:
                return (
                    <div className="w-full h-full rounded-full relative overflow-hidden bg-blue-600" style={{ background: 'radial-gradient(circle at 30% 30%, #60a5fa, #2563eb, #1e3a8a)', boxShadow: `${sphereShading}, ${unlocked ? '0 0 12px rgba(96, 165, 250, 0.6)' : ''}` }}>
                        {/* Continents */}
                        <div className="absolute top-[20%] left-[25%] w-[40%] h-[30%] bg-green-600/90 rounded-[40%] blur-[1px]"></div>
                        <div className="absolute bottom-[20%] right-[25%] w-[45%] h-[35%] bg-green-700/90 rounded-[35%] blur-[1px]"></div>
                        {/* Clouds */}
                        <div className="absolute top-[30%] left-[-10%] w-[120%] h-[15%] bg-white/30 blur-[3px] transform rotate-12"></div>
                        <div className="absolute bottom-[35%] left-[-10%] w-[120%] h-[10%] bg-white/20 blur-[3px] transform -rotate-6"></div>
                    </div>
                );
            case PlanetId.MARS:
                return (
                    <div className="w-full h-full rounded-full relative overflow-hidden" style={{ background: 'radial-gradient(circle at 30% 30%, #ef4444, #b91c1c, #7f1d1d)', boxShadow: `${sphereShading}, ${unlocked ? '0 0 10px rgba(239, 68, 68, 0.4)' : ''}` }}>
                        <div className="absolute top-0 left-[30%] w-[40%] h-[10%] bg-white/40 blur-[4px]"></div> {/* Ice cap */}
                        <div className="absolute top-[40%] left-[40%] w-[30%] h-[20%] bg-black/20 blur-[2px] rounded-full"></div> {/* Valles Marineris hint */}
                    </div>
                );
            case PlanetId.JUPITER:
                return (
                    <div className="w-full h-full rounded-full relative overflow-hidden" style={{ 
                        background: 'linear-gradient(170deg, #78350f 0%, #d97706 15%, #fcd34d 30%, #b45309 45%, #d97706 60%, #fffbeb 75%, #92400e 100%)', 
                        boxShadow: sphereShading,
                        transform: 'rotate(-15deg)'
                    }}>
                        <div className="absolute top-[60%] left-[60%] w-[20%] h-[12%] bg-red-900/40 rounded-full blur-[1px] shadow-inner border border-red-900/20"></div> {/* Great Red Spot */}
                        <div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, transparent 40%, rgba(0,0,0,0.4))' }}></div> {/* Spherical overlay on top of stripes */}
                    </div>
                );
            case PlanetId.SATURN:
                return (
                    <div className="relative w-full h-full flex items-center justify-center">
                        {/* Ring (Back) */}
                        <div className="absolute w-[180%] h-[50%] border-[6px] md:border-[10px] border-amber-200/40 rounded-[50%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-[-15deg]" 
                             style={{ borderTopColor: 'rgba(253, 230, 138, 0.1)', borderBottomColor: 'rgba(253, 230, 138, 0.6)' }}></div>
                        
                        {/* Planet Body */}
                        <div className="w-[85%] h-[85%] rounded-full relative z-10" style={{ 
                            background: 'linear-gradient(180deg, #ca8a04 0%, #fef08a 40%, #eab308 100%)',
                            boxShadow: sphereShading
                        }}></div>
                        
                         {/* Ring (Front - subtle overlay to complete illusion) */}
                         <div className="absolute w-[180%] h-[50%] border-[6px] md:border-[10px] border-transparent rounded-[50%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 transform rotate-[-15deg]" 
                             style={{ borderBottomColor: 'rgba(253, 230, 138, 0.7)' }}></div>
                    </div>
                );
            case PlanetId.URANUS:
                 return (
                    <div className="w-full h-full rounded-full relative" style={{ background: 'radial-gradient(circle at 30% 30%, #bae6fd, #38bdf8, #0ea5e9)', boxShadow: `${sphereShading}, ${unlocked ? '0 0 15px rgba(56, 189, 248, 0.4)' : ''}` }}>
                        <div className="absolute inset-0 bg-white/10 rounded-full blur-md"></div>
                    </div>
                );
            case PlanetId.NEPTUNE:
                 return (
                    <div className="w-full h-full rounded-full relative" style={{ background: 'radial-gradient(circle at 30% 30%, #60a5fa, #2563eb, #172554)', boxShadow: `${sphereShading}, ${unlocked ? '0 0 15px rgba(37, 99, 235, 0.5)' : ''}` }}>
                        <div className="absolute top-[30%] left-[20%] w-[15%] h-[8%] bg-blue-900/30 blur-[1px] rounded-full"></div> {/* Dark spot */}
                        <div className="absolute bottom-[20%] w-[80%] h-[20%] bg-white/5 blur-[3px] transform rotate-12"></div> {/* Clouds */}
                    </div>
                );
            case PlanetId.PLUTO:
                 return (
                    <div className="w-full h-full rounded-full relative" style={{ background: 'radial-gradient(circle at 30% 30%, #e7e5e4, #a8a29e, #57534e)', boxShadow: sphereShading }}>
                         <div className="absolute bottom-[10%] right-[15%] w-[30%] h-[30%] bg-white/20 rounded-full blur-[2px]"></div> {/* Heart region */}
                    </div>
                );
            default:
                return <div className="w-full h-full rounded-full" style={{ backgroundColor: color, boxShadow: sphereShading }}></div>;
        }
    };

    return (
        <div className="w-full h-full transition-all duration-500" style={{ filter: styleFilter }}>
            {renderPlanet()}
        </div>
    );
};

export const SolarSystem: React.FC = () => {
  const { state, setCurrentPlanet, playVoice, playSfx } = useGame();
  const [latestUnlockedId, setLatestUnlockedId] = useState<PlanetId | null>(null);

  useEffect(() => {
    // Find the most recently unlocked planet by checking its status against the previous state (or just finding the highest index)
    const lastUnlockedPlanetIndex = state.planets.reduce((latestIndex, planet, currentIndex) => {
        return planet.isUnlocked ? currentIndex : latestIndex;
    }, -1);
    
    // Only show the effect if a planet beyond Mercury was unlocked.
    if (lastUnlockedPlanetIndex > 0) {
        const justUnlockedId = state.planets[lastUnlockedPlanetIndex].id;
        setLatestUnlockedId(justUnlockedId);
        
        // The effect will last for 4 seconds.
        const timer = setTimeout(() => {
            setLatestUnlockedId(null);
        }, 4000);

        return () => clearTimeout(timer);
    }
  }, [state.planets]);

  const handlePlanetClick = (id: PlanetId, unlocked: boolean) => {
    playSfx('click'); // INSTANT FEEDBACK
    if (unlocked) {
      const introText = PLANET_INTROS[id] || `${id} gezegenine hoş geldin!`;
      playVoice(introText, undefined, { priority: true });
      setCurrentPlanet(id);
    } else {
      playVoice("Bu gezegen henüz kilitli. Önce diğerlerini tamamla!");
    }
  };

  // Adjusted orbit positions for a nice curve
  const positions = [
    { x: 60, y: 50 }, // Sun
    { x: 30, y: 45 }, // Mercury
    { x: 65, y: 30 }, // Venus
    { x: 80, y: 55 }, // Earth
    { x: 65, y: 80 }, // Mars
    { x: 20, y: 65 }, // Jupiter
    { x: 15, y: 25 }, // Saturn
    { x: 45, y: 15 }, // Uranus
    { x: 85, y: 20 }, // Neptune
    { x: 90, y: 85 }, // Pluto
  ];

  return (
    <div className="w-full h-screen relative overflow-hidden star-bg bg-slate-950">
        {/* Photorealistic Sun */}
        <motion.div 
            animate={{ scale: [1, 1.02, 1], filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-48 md:h-48 rounded-full z-10"
            style={{
                background: 'radial-gradient(circle, #fefce8 0%, #fde047 20%, #facc15 40%, #ea580c 70%, #9a3412 100%)',
                boxShadow: '0 0 40px rgba(253, 186, 116, 0.6), 0 0 80px rgba(234, 88, 12, 0.4), inset -10px -10px 40px rgba(153, 27, 27, 0.5)'
            }}
        >
             {/* Corona effect layers */}
             <div className="absolute inset-[-10px] rounded-full bg-orange-500/20 blur-xl animate-pulse"></div>
        </motion.div>

        {/* Planets */}
        {state.planets.map((planet, idx) => {
            const pos = positions[idx + 1]; // Skip sun idx 0
            // Dynamic size based on planet type roughly (Gas giants bigger)
            const isGiant = [PlanetId.JUPITER, PlanetId.SATURN].includes(planet.id);
            const isMedium = [PlanetId.EARTH, PlanetId.VENUS, PlanetId.URANUS, PlanetId.NEPTUNE].includes(planet.id);
            const baseSize = isGiant ? "w-28 h-28 md:w-40 md:h-40" : isMedium ? "w-20 h-20 md:w-28 md:h-28" : "w-16 h-16 md:w-20 md:h-20";
            const isLatestUnlocked = latestUnlockedId === planet.id;

            return (
                <motion.button
                    key={planet.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.15, zIndex: 50 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePlanetClick(planet.id, planet.isUnlocked)}
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    className={`absolute ${baseSize} z-20 flex flex-col items-center justify-center transition-all duration-300 ${
                        !planet.isUnlocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    {/* Unlock "Celebration" Effect */}
                    <AnimatePresence>
                        {isLatestUnlocked && (
                            <>
                                <motion.div
                                    initial={{ scale: 1.5, opacity: 0 }}
                                    animate={{ scale: 2.5, opacity: 0 }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="absolute inset-0 rounded-full border-4 border-white/50"
                                />
                                <motion.div
                                    initial={{ scale: 1 }}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                    className="absolute -inset-4 rounded-full border-2 border-dashed border-yellow-400/50"
                                />
                                <motion.div
                                     initial={{ y: -20, opacity: 0 }}
                                     animate={{ y: -60, opacity: 1 }}
                                     exit={{ opacity: 0 }}
                                     className="absolute bg-yellow-400 text-black font-bold px-3 py-1 rounded-full text-sm shadow-lg whitespace-nowrap z-50"
                                >
                                    <Sparkles size={14} className="inline mr-1"/> Kilit Açıldı!
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>

                    <PlanetVisual id={planet.id} color={planet.color} unlocked={planet.isUnlocked} />
                    
                    {!planet.isUnlocked && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full backdrop-blur-[1px]">
                            <Lock className="text-white/80 drop-shadow-md" size={isGiant ? 40 : 24} />
                        </div>
                    )}
                    
                    {planet.isUnlocked && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            whileHover={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-8 bg-black/60 text-white text-xs md:text-sm px-3 py-1 rounded-full backdrop-blur-md border border-white/10 whitespace-nowrap z-50 pointer-events-none"
                        >
                            <div className="font-bold text-center">{planet.name}</div>
                            <div className="flex justify-center gap-0.5 mt-0.5">
                                {[1, 2, 3].map(i => (
                                    <Star key={i} size={10} className={i <= planet.stars ? "text-yellow-400 fill-yellow-400" : "text-gray-500"} />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </motion.button>
            );
        })}

        {/* Selected Character Avatar in Corner */}
        <div className="absolute top-4 left-4 z-40">
             <div className={`w-20 h-20 rounded-full border-4 border-white/40 ${state.selectedCharacter?.color} flex items-center justify-center shadow-2xl relative overflow-hidden bg-white`}>
                {state.selectedCharacter ? (
                    <img
                        src={state.selectedCharacter.imageUrl}
                        alt={state.selectedCharacter.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-2xl drop-shadow-md relative z-0">🤖</span>
                )}
             </div>
        </div>
    </div>
  );
};