import React, { useState, useEffect, useRef } from 'react';
import { useGame, PLANET_INTROS } from './GameContext';
import { motion, AnimatePresence } from 'framer-motion';
import { PlanetId } from '../types';
import { X, Star, Rocket, Ghost, Sun, Sparkles, Flame, ArrowRight, Play, RotateCcw, Home, Volume2, Music, Heart, Moon, Key, Lock, Puzzle, Loader2, Image as ImageIcon, Zap, Radio, Battery, Disc, Radar, ArrowUp, ArrowLeft, ArrowDown, Footprints, Flag, Circle, Square, Triangle, Hexagon, Snowflake } from 'lucide-react';
import { RoboMi } from './RoboMi';
import { generateImage } from '../services/geminiService';

// --- Voice Helpers ---
const PRAISE_PHRASES = [
    "Harikasın küçük astronot!",
    "Süper gidiyorsun!",
    "İşte böyle!",
    "Müthişsin!",
    "Çok akıllısın!",
    "Yıldızlar kadar parlaksın!"
];

const RETRY_PHRASES = [
    "Bir daha deneyelim mi?",
    "Az kaldı, tekrar dene!",
    "Pes etmek yok, başarabilirsin!",
    "Dikkatli bak, bulabilirsin."
];

const getRandomPraise = () => PRAISE_PHRASES[Math.floor(Math.random() * PRAISE_PHRASES.length)];
const getRandomRetry = () => RETRY_PHRASES[Math.floor(Math.random() * RETRY_PHRASES.length)];

export const GameContainer: React.FC = () => {
    const { state, setCurrentPlanet, unlockNextPlanet, addStars, playVoice, playSfx, stopAudio } = useGame();
    const planet = state.planets.find(p => p.id === state.currentPlanet);
    
    // START SCREEN STATE
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [score, setScore] = useState(0);
    const [finished, setFinished] = useState(false);
    const [failed, setFailed] = useState(false);
    const [roboMessage, setRoboMessage] = useState("Hadi başlayalım!");
    const [mistakes, setMistakes] = useState(0);
    const [canStart, setCanStart] = useState(false);
    
    // Key to force re-mounting of mini-games on restart
    const [gameKey, setGameKey] = useState(0);
    // Track earned stars for the win screen display
    const [earnedStarsDisplay, setEarnedStarsDisplay] = useState(3);

    useEffect(() => {
        if (!planet) return;
        
        // When planet ID changes (new level loaded), enter Intro mode
        setIsGameRunning(false);
        setFinished(false);
        setFailed(false);
        setScore(0);
        setMistakes(0);
        setGameKey(0);
        setCanStart(false);
        
        const msg = PLANET_INTROS[planet.id] || "Hadi oynayalım!";
        setRoboMessage(msg);
        // DO NOT play voice here anymore. It's played on the Solar System screen.
        // playVoice(msg);

        // Calculate a reasonable delay for the text to be spoken
        // Significantly shortened as requested: Approx 40ms per char instead of 80ms
        const delay = Math.max(1000, msg.length * 40); 
        const timer = setTimeout(() => {
            setCanStart(true);
        }, delay);

        return () => clearTimeout(timer);
    }, [planet?.id]); 

    const handleStartGame = () => {
        stopAudio(); // Stop any lingering intro text
        playSfx('click');
        setIsGameRunning(true);
        setRoboMessage("Başarılar!");
    };

    const handleRestart = () => {
        stopAudio();
        playSfx('click');
        setFinished(false);
        setFailed(false);
        setScore(0);
        setMistakes(0);
        setGameKey(prev => prev + 1); // Increment key to reset mini-game internal state
        setIsGameRunning(true);
        setRoboMessage("Tekrar deneyelim!");
    };

    const handleFeedback = (text: string, type: 'success' | 'error' | 'neutral' = 'neutral') => {
        setRoboMessage(text);
        
        // PRIORITIZE SFX for immediate feedback
        if (type === 'success') {
            playSfx('success');
        } else if (type === 'error') {
            playSfx('error');
            // For general games, track mistakes globally unless game handles its own stars
            setMistakes(prev => prev + 1);
        } else {
            // Neutral events (like movement steps)
            playSfx('click');
        }

        // OPTIMIZATION: Do NOT play TTS for neutral events to prevent latency/lag.
        // Only speak for Success or Error events.
        if (type !== 'neutral') {
            playVoice(text);
        }
    };

    const handleFail = () => {
        setFailed(true);
        playSfx('error');
        const failText = "Görev başarısız oldu. Tekrar deneyelim!";
        setRoboMessage(failText);
        playVoice(failText);
    };

    const handleWin = (starsOverride?: number) => {
        // Calculate stars: Override > Props > Mistake-based
        let finalStars = 3;
        
        if (starsOverride !== undefined) {
            finalStars = starsOverride;
        } else {
            // Default mistake logic if game didn't provide specific stars
            if (mistakes === 0) finalStars = 3;
            else if (mistakes === 1) finalStars = 2;
            else if (mistakes >= 2) finalStars = 1;
            
            // If mistakes are too high (>3), usually we fail, but if handleWin is called, 
            // we assume success with 1 star minimum unless strictly failed before.
            if (mistakes > 3) finalStars = 1; 
        }

        // If stars are 0, treat as fail
        if (finalStars === 0) {
            handleFail();
            return;
        }

        setFinished(true);
        setEarnedStarsDisplay(finalStars);
        
        if (planet) {
             unlockNextPlanet(planet.id); // UNLOCK NEXT PLANET IMMEDIATELY
             addStars(planet.id, finalStars);
        }

        playSfx('success');
        
        const winText = `Görevi tamamladın! ${finalStars} yıldız kazandın!`;
        setRoboMessage(winText);
        playVoice(winText);
    };

    const handleBack = () => {
        stopAudio();
        playSfx('click');
        setCurrentPlanet(null);
    };

    const handleNextLevel = () => {
        stopAudio();
        playSfx('click');
        setCurrentPlanet(null);
    };

    if (!planet) return null;

    const isLastPlanet = state.planets.findIndex(p => p.id === planet.id) === state.planets.length - 1;

    return (
        <div className="fixed inset-0 bg-slate-900 z-50 flex flex-col">
            {/* Header */}
            <div className="p-4 flex justify-between items-center bg-slate-800 border-b border-slate-700 h-20 shadow-lg z-10">
                <h2 className="text-xl md:text-2xl font-bold truncate flex items-center gap-2" style={{ color: planet.color }}>
                    <span className="text-3xl">{planet.id === PlanetId.EARTH ? '🌍' : '🪐'}</span>
                    {planet.name} Görevi
                </h2>
                <div className="flex gap-2 bg-slate-900/50 px-4 py-2 rounded-full">
                    {/* Hide score stars for Mercury, it uses Heart system shown in game */}
                    {planet.id !== PlanetId.MERCURY && [1, 2, 3].map(i => (
                        <motion.div
                            key={i}
                            initial={{ scale: 1 }}
                            animate={i <= score ? { scale: [1, 1.5, 1], rotate: [0, 10, -10, 0] } : {}}
                        >
                            <Star className={i <= score ? "text-yellow-400 fill-yellow-400 drop-shadow-md" : "text-slate-600"} />
                        </motion.div>
                    ))}
                    <button onClick={handleBack} className="ml-4 bg-red-500/20 hover:bg-red-500/40 text-red-400 p-2 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
                
                {/* 1. FAILURE SCREEN */}
                {failed ? (
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center bg-white text-slate-900 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border-8 border-red-500 z-50"
                    >
                        <motion.div 
                            animate={{ rotate: [0, 5, -5, 0] }}
                            transition={{ repeat: Infinity, duration: 0.5 }}
                            className="text-8xl mb-4"
                        >
                            💥
                        </motion.div>
                        <h3 className="text-3xl font-black mb-4 text-red-600">GÖREV BAŞARISIZ</h3>
                        <p className="mb-8 text-slate-600 text-lg font-medium">Biraz daha dikkate ihtiyacımız var!</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleRestart}
                                className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 w-full py-4 rounded-xl font-bold text-xl shadow-[0_8px_0_rgb(234,179,8)] active:shadow-[0_4px_0_rgb(234,179,8)] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw /> Tekrar Dene
                            </button>
                            <button 
                                onClick={handleBack}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 w-full py-4 rounded-xl font-bold text-xl shadow-[0_8px_0_rgb(203,213,225)] active:shadow-[0_4px_0_rgb(203,213,225)] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                <Home /> Çıkış
                            </button>
                        </div>
                    </motion.div>
                ) : finished ? (
                    /* 2. WIN SCREEN */
                    <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center bg-white text-slate-900 p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border-8 border-yellow-400 z-50"
                    >
                        <motion.div 
                            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="text-8xl mb-4"
                        >
                            🏆
                        </motion.div>
                        <h3 className="text-3xl font-black mb-2 text-purple-600">GÖREV BAŞARILI!</h3>
                        
                        <div className="flex justify-center gap-2 mb-6">
                            {[1, 2, 3].map(i => (
                                <Star key={i} size={40} className={i <= earnedStarsDisplay ? "text-yellow-400 fill-yellow-400" : "text-gray-300"} />
                            ))}
                        </div>

                        <p className="mb-8 text-slate-600 text-lg font-medium">Harika bir iş çıkardın!</p>
                        
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={handleNextLevel}
                                className="bg-green-500 hover:bg-green-600 text-white w-full py-4 rounded-xl font-bold text-xl shadow-[0_8px_0_rgb(21,128,61)] active:shadow-[0_4px_0_rgb(21,128,61)] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                {isLastPlanet ? <Home /> : <ArrowRight />}
                                {isLastPlanet ? "Güneş Sistemine Dön" : "Sonraki Gezegen"}
                            </button>
                            <button 
                                onClick={handleRestart}
                                className="bg-blue-400 hover:bg-blue-500 text-white w-full py-4 rounded-xl font-bold text-xl shadow-[0_8px_0_rgb(59,130,246)] active:shadow-[0_4px_0_rgb(59,130,246)] active:translate-y-1 transition-all flex items-center justify-center gap-2"
                            >
                                <RotateCcw /> Tekrar Oyna
                            </button>
                        </div>
                    </motion.div>
                ) : !isGameRunning ? (
                    /* 3. INTRO SCREEN */
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center justify-center text-center max-w-lg w-full"
                    >
                        <motion.div 
                            animate={{ y: [0, -20, 0] }}
                            transition={{ repeat: Infinity, duration: 3 }}
                            className="w-48 h-48 rounded-full mb-8 shadow-[0_0_50px_rgba(255,255,255,0.2)] border-4 border-white/20 flex items-center justify-center text-8xl bg-black/40 backdrop-blur-sm"
                            style={{ boxShadow: `0 0 80px ${planet.color}66` }}
                        >
                             {planet.id === PlanetId.EARTH ? '🌍' : '🪐'}
                        </motion.div>
                        
                        <h2 className="text-4xl font-black text-white mb-6 drop-shadow-lg">{planet.name}</h2>
                        <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-md mb-8">
                             <p className="text-xl md:text-2xl leading-relaxed text-blue-100">{PLANET_INTROS[planet.id]}</p>
                        </div>

                        <button 
                            onClick={handleStartGame}
                            disabled={!canStart}
                            className={`text-2xl font-black py-4 px-12 rounded-full shadow-[0_0_30px_rgba(250,204,21,0.5)] flex items-center gap-3 transition-all ${
                                !canStart 
                                ? 'bg-slate-600 text-slate-400 cursor-not-allowed grayscale' 
                                : 'bg-yellow-400 hover:bg-yellow-500 text-slate-900 transform hover:scale-105 active:scale-95'
                            }`}
                        >
                            {!canStart ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />}
                            {!canStart ? "DİNLENİYOR..." : "BAŞLA"}
                        </button>
                    </motion.div>
                ) : (
                    /* 4. GAME PLAY (Passed key to force reset on restart) */
                    <>
                        {planet.id === PlanetId.MERCURY && <MercuryGame key={gameKey} onScore={() => setScore(s => Math.min(s+1, 3))} onFinish={handleWin} onFail={handleFail} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.VENUS && <VenusGame key={gameKey} onFinish={handleWin} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.EARTH && <EarthGame key={gameKey} onFinish={handleWin} onFail={handleFail} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.MARS && <MarsGame key={gameKey} onFinish={handleWin} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.JUPITER && <JupiterGame key={gameKey} onFinish={handleWin} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.SATURN && <SaturnGame key={gameKey} onFinish={handleWin} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.URANUS && <UranusGame key={gameKey} onFinish={handleWin} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.NEPTUNE && <NeptuneGame key={gameKey} onFinish={handleWin} onFeedback={handleFeedback} />}
                        {planet.id === PlanetId.PLUTO && <PlutoGame key={gameKey} onFinish={handleWin} onFeedback={handleFeedback} />}
                    </>
                )}
            </div>
        </div>
    );
};

// --- Types ---
interface GameProps {
  onScore?: () => void;
  onFinish: (stars?: number) => void;
  onFail?: () => void;
  onFeedback: (text: string, type: 'success' | 'error' | 'neutral') => void;
}

// --- 1. MERCURY: Hızlı Dokunma ve Renkler ---
const MercuryGame: React.FC<GameProps> = ({ onScore, onFinish, onFail, onFeedback }) => {
  const [items, setItems] = useState<{ id: number, type: 'good' | 'bad', x: number, y: number, exploded?: boolean }[]>([]);
  const [round, setRound] = useState(1);
  const [hearts, setHearts] = useState(3);
  const [roundKey, setRoundKey] = useState(0);

  const ITEMS_PER_ROUND = 8; // 5 Good + 3 Bad

  const spawnItems = () => {
    const newItems = [];
    // Ensure exactly 5 good, 3 bad
    const types: ('good' | 'bad')[] = [
        'good', 'good', 'good', 'good', 'good',
        'bad', 'bad', 'bad'
    ];
    // Shuffle
    types.sort(() => Math.random() - 0.5);

    for (let i = 0; i < ITEMS_PER_ROUND; i++) {
        newItems.push({
            id: Date.now() + i,
            type: types[i],
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10,
            exploded: false
        });
    }
    setItems(newItems);
  };

  useEffect(() => {
    spawnItems();
  }, [round, roundKey]);

  useEffect(() => {
    if (hearts <= 0) {
        if (onFail) onFail();
    }
  }, [hearts, onFail]);

  const handleClick = (id: number, type: 'good' | 'bad', exploded: boolean) => {
    if (exploded) return;

    if (type === 'bad') {
      onFeedback('Dikkat! Kırmızı yakar!', 'error');
      setHearts(prev => prev - 1);
      // Explode the bad one visual
      setItems(prev => prev.map(item => item.id === id ? { ...item, exploded: true } : item));
      setTimeout(() => {
         setItems(prev => prev.filter(item => item.id !== id));
      }, 500);
    } else {
      onFeedback(getRandomPraise(), 'success');
      // Sparkle good one
      setItems(prev => prev.map(item => item.id === id ? { ...item, exploded: true } : item));
      setTimeout(() => {
         const remaining = items.filter(item => item.id !== id && !item.exploded);
         const remainingGood = remaining.filter(i => i.type === 'good');
         
         if (remainingGood.length === 0) {
            // Round Complete
            if (round < 3) {
                setRound(r => r + 1);
                if (onScore) onScore(); // Just to animate UI stars slightly if needed
            } else {
                // Game Complete - Pass stars based on remaining hearts
                onFinish(hearts); 
            }
         }
         setItems(prev => prev.filter(item => item.id !== id));
      }, 300);
    }
  };

  return (
    <div className="w-full h-full relative">
       {/* Heart Display */}
       <div className="absolute top-0 left-0 right-0 flex justify-center gap-2 p-4 pointer-events-none z-20">
            {[1, 2, 3].map(h => (
                <motion.div 
                    key={h}
                    animate={h <= hearts ? { scale: 1 } : { scale: 0, opacity: 0 }}
                >
                    <Heart className="text-red-500 fill-red-500 drop-shadow-md" size={32} />
                </motion.div>
            ))}
       </div>

      <AnimatePresence>
      {items.map(item => (
        <motion.button
          key={item.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: item.exploded ? (item.type === 'bad' ? 2 : 1.5) : 1, 
            opacity: item.exploded ? 0 : 1,
            y: [0, -10, 0] // Floating animation
          }}
          transition={{ 
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            default: { duration: 0.3 }
          }}
          style={{ left: `${item.x}%`, top: `${item.y}%` }}
          className={`absolute w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-lg border-4 ${
            item.type === 'bad' ? 'bg-red-500 border-red-700' : 'bg-blue-400 border-blue-200'
          }`}
          onClick={() => handleClick(item.id, item.type, !!item.exploded)}
        >
          {item.type === 'bad' ? <Flame size={32} className="text-white" /> : <Sparkles size={32} className="text-white" />}
        </motion.button>
      ))}
      </AnimatePresence>
    </div>
  );
};

// --- 2. VENUS: Ses Eşleştirme (Simon Says) ---
const VenusGame: React.FC<GameProps> = ({ onFinish, onFeedback }) => {
  const { playSfx } = useGame();
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);

  const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500'];
  // C4, E4, G4, C5 notes for a melodic feel
  const FREQUENCIES = [261.63, 329.63, 392.00, 523.25];
  
  useEffect(() => {
    startLevel();
  }, [level]);

  const startLevel = async () => {
    setUserSequence([]);
    const newSeq = [...Array(level + 1)].map(() => Math.floor(Math.random() * 4));
    setSequence(newSeq);
    setIsPlaying(true);
    
    // Play sequence
    for (let i = 0; i < newSeq.length; i++) {
        await new Promise(r => setTimeout(r, 600));
        highlightColor(newSeq[i], true); // Play sound during sequence
    }
    setIsPlaying(false);
    onFeedback("Sıra sende!", 'neutral');
  };

  const highlightColor = (idx: number, playSound: boolean = false) => {
    if (playSound) {
        playSfx('tone', { frequency: FREQUENCIES[idx] });
    }
    const el = document.getElementById(`btn-${idx}`);
    if (el) {
        el.style.opacity = '0.5';
        el.style.transform = 'scale(1.1)';
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'scale(1)';
        }, 300);
    }
  };

  const handleClick = (idx: number) => {
    if (isPlaying) return;
    playSfx('tone', { frequency: FREQUENCIES[idx] });
    highlightColor(idx);
    
    const newUserSeq = [...userSequence, idx];
    setUserSequence(newUserSeq);

    if (newUserSeq[newUserSeq.length - 1] !== sequence[newUserSeq.length - 1]) {
        onFeedback("Hata oldu, tekrar deneyelim!", 'error');
        setTimeout(() => startLevel(), 1000);
        return;
    }

    if (newUserSeq.length === sequence.length) {
        onFeedback(getRandomPraise(), 'success');
        if (level < 3) {
            setTimeout(() => setLevel(l => l + 1), 1000);
        } else {
            onFinish();
        }
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 max-w-sm w-full aspect-square">
        {colors.map((color, idx) => (
            <button
                key={idx}
                id={`btn-${idx}`}
                onClick={() => handleClick(idx)}
                className={`${color} rounded-2xl shadow-xl transition-all duration-100 border-b-8 border-black/20 active:border-b-0 active:translate-y-2`}
            />
        ))}
    </div>
  );
};

// --- 3. EARTH: Generative AI Puzzle (Realistic Jigsaw Shapes) ---
type EdgeType = 0 | 1 | -1; // 0: Flat, 1: Tab (Out), -1: Hole (In)
interface PieceShape {
    top: EdgeType;
    right: EdgeType;
    bottom: EdgeType;
    left: EdgeType;
}

const EarthGame: React.FC<GameProps> = ({ onFinish, onFail, onFeedback }) => {
    const [levelIdx, setLevelIdx] = useState(0);
    const LEVELS = [3, 3, 3]; // Always 3x3
    const size = LEVELS[levelIdx];
    
    // State
    const [gridState, setGridState] = useState<(number | null)[]>([]); // What piece ID is in each slot?
    const [trayPieces, setTrayPieces] = useState<number[]>([]); // IDs of pieces in tray
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [shapes, setShapes] = useState<PieceShape[]>([]);
    
    // Image
    const [image, setImage] = useState<string | null>(null);
    const [loadingImage, setLoadingImage] = useState(true);

    const FALLBACK_IMAGES = [
        "https://images.unsplash.com/photo-1614726365723-498aa67c5f7b?q=80&w=1080", // Artistic Earth/Space
        "https://images.unsplash.com/photo-1632395623788-b7c405c935bc?q=80&w=1080", // Vector style planet
        "https://images.unsplash.com/photo-1541873676-a18131494184?q=80&w=1080", // Colorful Nebula
        "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1080", // Gradient/Abstract
        "https://images.unsplash.com/photo-1534293630396-6b22eb84610e?q=80&w=1080"  // Playful Planet Art
    ];

    // Generate puzzle shapes
    const generateShapes = (gridSize: number) => {
        const newShapes: PieceShape[] = [];
        for (let i = 0; i < gridSize * gridSize; i++) {
            const row = Math.floor(i / gridSize);
            const col = i % gridSize;
            
            let top: EdgeType = 0;
            let left: EdgeType = 0;
            let bottom: EdgeType = 0;
            let right: EdgeType = 0;

            // Connect to Top Neighbor
            if (row > 0) {
                const topNeighbor = newShapes[(row - 1) * gridSize + col];
                top = (topNeighbor.bottom * -1) as EdgeType;
            }
            // Connect to Left Neighbor
            if (col > 0) {
                const leftNeighbor = newShapes[row * gridSize + col - 1];
                left = (leftNeighbor.right * -1) as EdgeType;
            }
            // Create Bottom Edge (Random if not last row)
            if (row < gridSize - 1) {
                bottom = Math.random() > 0.5 ? 1 : -1;
            }
            // Create Right Edge (Random if not last col)
            if (col < gridSize - 1) {
                right = Math.random() > 0.5 ? 1 : -1;
            }
            
            newShapes.push({ top, right, bottom, left });
        }
        return newShapes;
    };

    // Initialize Level
    useEffect(() => {
        const initLevel = async () => {
            setLoadingImage(true);
            setGridState(new Array(size * size).fill(null));
            
            // Generate shapes
            setShapes(generateShapes(size));
            
            // Mix pieces
            const pieces = Array.from({ length: size * size }, (_, i) => i);
            setTrayPieces(pieces.sort(() => Math.random() - 0.5));
            setSelectedPiece(null);

            // Generate Image
            let prompt = "cute 3d cartoon earth planet with a happy face, space background, colorful illustration, vibrant colors, pixar style, simple vector art";
            if (levelIdx === 1) prompt = "cute 3d cartoon mars planet, red and orange, funny aliens waving, space background, colorful illustration, vibrant colors, pixar style";
            if (levelIdx === 2) prompt = "cute 3d cartoon saturn planet with colorful rings, purple and blue colors, space background, colorful illustration, vibrant colors, pixar style";

            const genImg = await generateImage(prompt, '1K', '1:1');
            
            if (genImg) {
                setImage(genImg);
            } else {
                const fallbackUrl = FALLBACK_IMAGES[levelIdx % FALLBACK_IMAGES.length];
                setImage(fallbackUrl);
            }
            setLoadingImage(false);
        };

        initLevel();
    }, [levelIdx]);

    // SVG Path Generator for 100x100 logical unit piece with ~25 unit tabs
    const getPiecePath = (shape: PieceShape) => {
        // Base 100x100. ViewBox will need to accommodate tabs (-25 to 125 range)
        // We assume 0,0 is top-left of the square content
        
        let d = `M 0 0`;
        
        // TOP EDGE
        if (shape.top === 0) {
            d += ` L 100 0`;
        } else {
            // Tab (-y) or Hole (+y)
            const s = shape.top === 1 ? -1 : 1; 
            d += ` L 35 0 C 35 0 35 ${25 * s} 50 ${25 * s} C 65 ${25 * s} 65 0 65 0 L 100 0`;
        }

        // RIGHT EDGE
        if (shape.right === 0) {
            d += ` L 100 100`;
        } else {
            const s = shape.right === 1 ? 1 : -1;
            d += ` L 100 35 C 100 35 ${100 + 25 * s} 35 ${100 + 25 * s} 50 C ${100 + 25 * s} 65 100 65 100 65 L 100 100`;
        }

        // BOTTOM EDGE
        if (shape.bottom === 0) {
            d += ` L 0 100`;
        } else {
            const s = shape.bottom === 1 ? 1 : -1;
            d += ` L 65 100 C 65 100 65 ${100 + 25 * s} 50 ${100 + 25 * s} C 35 ${100 + 25 * s} 35 100 35 100 L 0 100`;
        }

        // LEFT EDGE
        if (shape.left === 0) {
            d += ` L 0 0`;
        } else {
            const s = shape.left === 1 ? -1 : 1;
            d += ` L 0 65 C 0 65 ${0 + 25 * s} 65 ${0 + 25 * s} 50 C ${0 + 25 * s} 35 0 35 0 35 L 0 0`;
        }
        
        d += " Z";
        return d;
    };

    const handleTrayClick = (pieceId: number) => {
        playSfx('click');
        setSelectedPiece(pieceId);
    };

    const handleGridClick = (slotIdx: number) => {
        if (selectedPiece === null) return;
        
        if (gridState[slotIdx] !== null) {
            onFeedback("Orası dolu!", "error");
            return;
        }

        if (slotIdx !== selectedPiece) {
            onFeedback("Bu parça buraya ait değil.", "error");
            return;
        }

        playSfx('pop');
        const newGrid = [...gridState];
        newGrid[slotIdx] = selectedPiece;
        setGridState(newGrid);
        setTrayPieces(prev => prev.filter(p => p !== selectedPiece));
        setSelectedPiece(null);

        if (newGrid.every(cell => cell !== null)) {
            onFeedback(getRandomPraise(), 'success');
            setTimeout(() => {
                if (levelIdx < LEVELS.length - 1) {
                    setLevelIdx(prev => prev + 1);
                } else {
                    onFinish();
                }
            }, 1000);
        }
    };

    const playSfx = (type: 'click' | 'pop') => {
        // Logic handled by parent hook usually, but for local use if needed
    };

    if (loadingImage) {
        return (
            <div className="flex flex-col items-center justify-center text-white">
                <Loader2 size={48} className="animate-spin mb-4 text-blue-400" />
                <p className="text-xl animate-pulse">Yeni gezegen keşfediliyor...</p>
            </div>
        );
    }

    // Helper to render a single piece SVG
    const renderPiece = (pieceId: number, inTray: boolean) => {
        const shape = shapes[pieceId];
        const pathData = getPiecePath(shape);
        const row = Math.floor(pieceId / size);
        const col = pieceId % size;
        
        // Calculate image offset relative to piece 0,0
        // The ViewBox is -25 -25 150 150 (Total 150x150 units).
        // The piece content (0-100) is centered in logic.
        // Image needs to be sized (size * 100) and positioned at -(col*100), -(row*100)
        
        return (
            <svg 
                viewBox="-25 -25 150 150" 
                className={`w-full h-full drop-shadow-xl filter ${inTray ? 'hover:scale-105 transition-transform' : ''}`}
                style={{ overflow: 'visible' }}
            >
                <defs>
                    <clipPath id={`clip-${pieceId}`}>
                        <path d={pathData} />
                    </clipPath>
                </defs>
                <g clipPath={`url(#clip-${pieceId})`}>
                     {/* The image */}
                     <image 
                        href={image!} 
                        x={-col * 100} 
                        y={-row * 100} 
                        width={size * 100} 
                        height={size * 100} 
                        preserveAspectRatio="none"
                    />
                    {/* Outline overlay for definition */}
                    <path d={pathData} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <path d={pathData} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
                </g>
            </svg>
        );
    };

    return (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-6 w-full max-w-6xl h-full p-4">
            {/* Grid Area */}
            <div 
                className="grid gap-0 bg-slate-800/50 p-3 rounded-xl shadow-2xl border-4 border-slate-600 relative flex-shrink-0"
                style={{ 
                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                    width: 'min(90vw, 380px)', // Slightly smaller max width
                    aspectRatio: '1/1'
                }}
            >
                {Array.from({ length: size * size }).map((_, idx) => (
                    <div 
                        key={idx}
                        onClick={() => handleGridClick(idx)}
                        className={`relative z-0 ${selectedPiece !== null && gridState[idx] === null ? 'bg-yellow-400/20 animate-pulse cursor-pointer' : ''}`}
                        style={{ zIndex: gridState[idx] !== null ? 10 : 0 }}
                    >
                        {/* Placeholder / Outline */}
                         {shapes[idx] && (
                             <div className="absolute inset-0 pointer-events-none" style={{ width: '150%', height: '150%', top: '-25%', left: '-25%', zIndex: 1 }}>
                                <svg viewBox="-25 -25 150 150" className="w-full h-full opacity-60">
                                    <path 
                                        d={getPiecePath(shapes[idx])} 
                                        fill="rgba(255,255,255,0.05)" 
                                        stroke="rgba(255,255,255,0.2)" 
                                        strokeWidth="1.5" 
                                        strokeDasharray="6 4" 
                                    />
                                </svg>
                            </div>
                        )}

                        {gridState[idx] !== null && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute inset-0 pointer-events-none"
                                style={{ 
                                    width: '150%', height: '150%', 
                                    top: '-25%', left: '-25%',
                                    zIndex: 20
                                }}
                            >
                                {renderPiece(gridState[idx]!, false)}
                            </motion.div>
                        )}
                    </div>
                ))}
            </div>

            {/* Tray Area - Right Sidebar (Desktop) */}
            <div 
                className="flex flex-col items-center bg-slate-900/80 p-6 rounded-2xl border-2 border-white/10 shadow-xl backdrop-blur-sm"
                style={{
                    width: 'min(90vw, 380px)', // Same width constraint as grid
                    minHeight: '380px' // Similar height to balance visual weight
                }}
            >
                <h3 className="text-blue-200 font-bold mb-6 tracking-wider text-sm uppercase flex items-center gap-2">
                    <Puzzle size={18} /> Parça Havuzu
                </h3>
                
                <div className="grid grid-cols-3 gap-4 w-full place-items-center flex-1 content-center">
                    <AnimatePresence>
                        {trayPieces.map(pieceId => (
                            <motion.button
                                key={pieceId}
                                layoutId={`piece-${pieceId}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                onClick={() => handleTrayClick(pieceId)}
                                className="w-full aspect-square relative"
                            >
                                <div className="absolute inset-0 pointer-events-none" style={{ width: '150%', height: '150%', top: '-25%', left: '-25%' }}>
                                    {renderPiece(pieceId, true)}
                                </div>
                                {selectedPiece === pieceId && (
                                    <div className="absolute inset-2 border-2 border-yellow-400 rounded-lg z-50 pointer-events-none animate-pulse box-border"></div>
                                )}
                            </motion.button>
                        ))}
                    </AnimatePresence>
                </div>

                {trayPieces.length === 0 && (
                    <div className="text-green-400 font-bold flex flex-col items-center gap-2 mt-4 animate-bounce">
                        <Sparkles size={32} />
                        <span>Tamamlandı!</span>
                    </div>
                )}
                
                {trayPieces.length > 0 && (
                    <div className="mt-4 text-xs text-slate-400 text-center">
                        Parçayı seç,<br/>yerine koy!
                    </div>
                )}
            </div>
        </div>
    );
};

// --- 4. MARS: Sayma Oyunu (3-Level Progression) ---
const MarsGame: React.FC<GameProps> = ({ onFinish, onFeedback }) => {
  const [level, setLevel] = useState(1);
  const [targetNumber, setTargetNumber] = useState(1);
  const [options, setOptions] = useState<number[]>([]);
  const [isLocked, setIsLocked] = useState(false);

  const LEVELS = [
    { level: 1, min: 1, max: 3, optionsCount: 3 },
    { level: 2, min: 3, max: 6, optionsCount: 4 },
    { level: 3, min: 5, max: 9, optionsCount: 5 }
  ];

  useEffect(() => {
    newRound();
  }, [level]);

  const newRound = () => {
    setIsLocked(false);
    const config = LEVELS[level - 1];
    const num = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
    setTargetNumber(num);
    const opts = new Set<number>();
    opts.add(num);
    while(opts.size < config.optionsCount) {
        const r = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
        opts.add(r);
    }
    setOptions(Array.from(opts).sort((a, b) => a - b));
  };

  const handleSelect = (n: number) => {
    if (isLocked) return;

    if (n === targetNumber) {
        setIsLocked(true);
        onFeedback(getRandomPraise(), 'success');
        setTimeout(() => {
            if (level < 3) {
                setLevel(l => l + 1);
            } else {
                onFinish();
            }
        }, 1500);
    } else {
        onFeedback(getRandomRetry(), 'error');
    }
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-lg">
      <div className="text-xl font-bold text-red-300 bg-red-900/50 px-6 py-2 rounded-full border border-red-500/30">
        Seviye {level} / 3
      </div>
      <div className="flex flex-wrap gap-x-2 gap-y-4 justify-center items-center min-h-[150px] w-full bg-slate-800/50 p-4 rounded-xl border border-white/10">
          {[...Array(targetNumber)].map((_, i) => (
              <motion.div 
                  key={i} 
                  initial={{ scale: 0, rotate: -180 }} 
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 15 }}
                  className="text-5xl md:text-6xl text-yellow-300 drop-shadow-[0_0_5px_rgba(253,244,158,0.7)]"
              >
                  ⭐
              </motion.div>
          ))}
      </div>
      <div className="flex gap-4 flex-wrap justify-center">
          {options.map(opt => (
              <motion.button
                  key={opt}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSelect(opt)}
                  className="bg-white text-slate-900 w-20 h-20 rounded-full text-4xl font-bold shadow-lg hover:bg-red-100 transition-colors border-b-4 border-slate-300 active:border-b-0 active:translate-y-1 disabled:opacity-50"
                  disabled={isLocked}
              >
                  {opt}
              </motion.button>
          ))}
      </div>
    </div>
  );
};

// --- 5. JUPITER: Hafıza Kartları (3 Progressive Stages) ---
const JupiterGame: React.FC<GameProps> = ({ onFinish, onFeedback }) => {
    const [cards, setCards] = useState<{ id: number, emoji: string, flipped: boolean, matched: boolean }[]>([]);
    const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
    const [stage, setStage] = useState(1); // 1, 2, 3
    const [isLock, setIsLock] = useState(false);
  
    const STAGES = [
        { pairs: 2, cols: 2 }, // 4 Cards
        { pairs: 3, cols: 3 }, // 6 Cards
        { pairs: 4, cols: 4 }, // 8 Cards
    ];
  
    // Replaced Alien/UFO with Kid-Friendly Space Icons (Sun, Moon, Telescope, etc.)
    const ICONS = ['🚀', '🌍', '🌟', '☀️', '🌙', '☄️', '🛰️', '🔭'];
  
    useEffect(() => {
      initStage();
    }, [stage]);
  
    const initStage = () => {
      const { pairs } = STAGES[stage - 1];
      const selectedIcons = ICONS.slice(0, pairs);
      const deck = [...selectedIcons, ...selectedIcons]
          .sort(() => Math.random() - 0.5)
          .map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
      
      setCards(deck);
      setFlippedIndices([]);
      setIsLock(false);
    };
  
    const handleCardClick = (idx: number) => {
      if (isLock || cards[idx].flipped || cards[idx].matched) return;
  
      const newFlipped = [...flippedIndices, idx];
      setFlippedIndices(newFlipped);
      
      const newCards = [...cards];
      newCards[idx].flipped = true;
      setCards(newCards);
  
      if (newFlipped.length === 2) {
          setIsLock(true);
          const [firstIdx, secondIdx] = newFlipped;
          
          if (cards[firstIdx].emoji === cards[secondIdx].emoji) {
              onFeedback("Eşleşti!", 'success');
              newCards[firstIdx].matched = true;
              newCards[secondIdx].matched = true;
              setCards(newCards);
              setFlippedIndices([]);
              setIsLock(false);
  
              if (newCards.every(c => c.matched)) {
                  setTimeout(() => {
                      if (stage < 3) {
                          setStage(s => s + 1);
                          onFeedback(`Harika! Seviye ${stage + 1} başlıyor.`, 'success');
                      } else {
                          onFinish();
                      }
                  }, 1000);
              }
          } else {
              onFeedback("Aynı değil!", 'error');
              setTimeout(() => {
                  newCards[firstIdx].flipped = false;
                  newCards[secondIdx].flipped = false;
                  setCards(newCards);
                  setFlippedIndices([]);
                  setIsLock(false);
              }, 1000);
          }
      }
    };
  
    const currentCols = STAGES[stage - 1].cols;
  
    return (
      <div 
          className="grid gap-4 w-full max-w-sm"
          style={{ gridTemplateColumns: `repeat(${currentCols}, 1fr)` }}
      >
          {cards.map((card, idx) => (
              <div 
                  key={card.id}
                  className="relative aspect-[3/4] cursor-pointer"
                  style={{ perspective: '1000px' }}
                  onClick={() => handleCardClick(idx)}
              >
                  <motion.div
                      initial={false}
                      animate={{ scaleX: card.flipped || card.matched ? [1, 0, 1] : 1 }}
                      transition={{ duration: 0.4 }}
                      className={`w-full h-full rounded-2xl shadow-xl flex items-center justify-center text-4xl border-b-8 border-black/10 select-none ${
                          card.flipped || card.matched ? 'bg-white' : 'bg-orange-500'
                      }`}
                  >
                      {/* Only show content if "flipped" state is effectively true (after half rotation simulation) */}
                      {card.flipped || card.matched ? card.emoji : '❓'}
                  </motion.div>
              </div>
          ))}
      </div>
    );
};

// --- 6. SATURN: Desen/Örüntü Tamamlama (Pattern Matching) ---
const SaturnGame: React.FC<GameProps> = ({ onFinish, onFeedback }) => {
    const [level, setLevel] = useState(1);
    const [pattern, setPattern] = useState<any[]>([]);
    const [missingIdx, setMissingIdx] = useState(0);
    const [options, setOptions] = useState<any[]>([]);

    useEffect(() => {
        initLevel();
    }, [level]);

    const initLevel = () => {
        // Level 1: Simple Shapes (Circle, Square)
        // Level 2: Colors
        // Level 3: Space Icons
        
        let items = [];
        let seq = [];
        
        if (level === 1) {
            items = [
                { id: 'c', val: <Circle className="text-red-500" size={32} /> },
                { id: 's', val: <Square className="text-blue-500" size={32} /> }
            ];
            // ABAB Pattern
            seq = [items[0], items[1], items[0], items[1], items[0], null]; // Missing last
        } else if (level === 2) {
             items = [
                { id: 'g', val: <div className="w-8 h-8 rounded-full bg-green-500" /> },
                { id: 'y', val: <div className="w-8 h-8 rounded-full bg-yellow-500" /> },
                { id: 'p', val: <div className="w-8 h-8 rounded-full bg-purple-500" /> }
            ];
            // AABB Pattern
            seq = [items[0], items[0], items[1], items[1], items[2], null]; // Expect items[2]
        } else {
             items = [
                { id: 'star', val: '⭐' },
                { id: 'moon', val: '🌙' },
                { id: 'sun', val: '☀️' }
            ];
            // ABC Pattern
            seq = [items[0], items[1], items[2], items[0], items[1], null]; // Expect items[2]
        }
        
        setPattern(seq);
        setMissingIdx(seq.length - 1);
        
        // Options: correct + random distractors
        const correct = level === 1 ? items[1] : level === 2 ? items[2] : items[2];
        const distractors = items.filter(i => i.id !== correct.id);
        const opts = [correct, ...distractors].sort(() => Math.random() - 0.5);
        setOptions(opts);
    };

    const handleSelect = (item: any) => {
        // Determine correct answer based on pattern logic hardcoded above
        let isCorrect = false;
        if (level === 1 && item.id === 's') isCorrect = true;
        if (level === 2 && item.id === 'p') isCorrect = true;
        if (level === 3 && item.id === 'sun') isCorrect = true;

        if (isCorrect) {
            onFeedback(getRandomPraise(), 'success');
            const newPattern = [...pattern];
            newPattern[missingIdx] = item;
            setPattern(newPattern);
            setTimeout(() => {
                if (level < 3) setLevel(l => l + 1);
                else onFinish();
            }, 1000);
        } else {
            onFeedback("Bu uymadı, tekrar dene!", 'error');
        }
    };

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-2xl">
            <div className="bg-slate-800/80 p-6 rounded-full border-4 border-yellow-500/50 flex gap-4 items-center justify-center min-h-[100px] w-full overflow-x-auto shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                {pattern.map((item, idx) => (
                    <motion.div 
                        key={idx}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-md ${item ? 'bg-white' : 'bg-white/10 border-2 border-dashed border-white/50 animate-pulse'}`}
                    >
                        {item ? item.val : '?'}
                    </motion.div>
                ))}
            </div>

            <div className="flex gap-4">
                {options.map((opt, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleSelect(opt)}
                        className="w-20 h-20 bg-white rounded-2xl shadow-xl flex items-center justify-center text-4xl hover:bg-blue-50 transition-colors border-b-4 border-slate-300 active:border-b-0 active:translate-y-1"
                    >
                        {opt.val}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};

// --- 7. URANUS: Hayalet Yakalamaca (Whac-A-Mole Style) ---
const UranusGame: React.FC<GameProps> = ({ onFinish, onFeedback }) => {
    const [score, setScore] = useState(0);
    const [activeSlot, setActiveSlot] = useState<number | null>(null);
    const [level, setLevel] = useState(1);
    const [timer, setTimer] = useState(0);
    
    // Level configs: Target 3, 4, 5. Characters: Ghost, Alien, Monster.
    const LEVELS = [
        { 
            target: 3, 
            speed: 1500, 
            icon: <Ghost className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]" size={40} />,
            color: 'bg-white/20'
        },
        { 
            target: 4, 
            speed: 1100, 
            icon: <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]">👽</div>,
            color: 'bg-green-500/20'
        },
        { 
            target: 5, 
            speed: 800, 
            icon: <div className="text-4xl filter drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">👾</div>,
            color: 'bg-red-500/20'
        }
    ];

    const config = LEVELS[level - 1];

    useEffect(() => {
        const interval = setInterval(() => {
            // Pick random slot 0-8
            const nextSlot = Math.floor(Math.random() * 9);
            setActiveSlot(nextSlot);
            setTimer(t => t + 1);
        }, config.speed);

        return () => clearInterval(interval);
    }, [level, timer]);

    const handleTap = (idx: number) => {
        if (idx === activeSlot) {
            onFeedback("Yakaladın!", "success");
            const newScore = score + 1;
            setScore(newScore);
            setActiveSlot(null); // Hide immediately

            if (newScore >= config.target) {
                if (level < 3) {
                    setTimeout(() => {
                        setScore(0);
                        setLevel(l => l + 1);
                        onFeedback(`Harika! Seviye ${level + 1} hızlanıyor!`, 'success');
                    }, 500);
                } else {
                    onFinish();
                }
            }
        } else {
            // Missed
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-4 text-cyan-300 text-xl font-bold">
                <div className="bg-cyan-900/50 px-4 py-2 rounded-full border border-cyan-500/30">
                    Seviye {level}
                </div>
                <div className="bg-cyan-900/50 px-4 py-2 rounded-full border border-cyan-500/30">
                    Yakalanan: {score} / {config.target}
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 bg-cyan-900/40 p-6 rounded-3xl border-4 border-cyan-500/30 backdrop-blur-sm shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                {Array.from({ length: 9 }).map((_, idx) => (
                    <div 
                        key={idx}
                        onClick={() => handleTap(idx)}
                        className="w-20 h-20 bg-cyan-800/50 rounded-2xl shadow-inner border border-cyan-400/20 relative overflow-hidden cursor-pointer active:scale-95 transition-transform"
                    >
                        <AnimatePresence mode='wait'>
                            {activeSlot === idx && (
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0, opacity: 0 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    {config.icon}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Ice effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none"></div>
                    </div>
                ))}
            </div>
             <div className="text-sm text-cyan-200/60 animate-pulse">Karakteri görünce dokun!</div>
        </div>
    );
};

// --- 8. NEPTUNE: Maze Escape ---
const NeptuneGame: React.FC<GameProps> = ({ onFinish, onFeedback }) => {
    const { playVoice } = useGame();
    const [level, setLevel] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 }); // Current Grid Position
    const [dir, setDir] = useState(1); // 0: Up, 1: Right, 2: Down, 3: Left
    
    // Grid Setup: 5x5
    // 0: Empty, 1: Wall, 2: Start, 3: Exit, 4: Black Hole
    // LEVEL 1: Simple L shape
    const LEVEL_1 = [
        [1, 1, 1, 1, 1],
        [2, 0, 0, 0, 1],
        [1, 1, 1, 0, 1],
        [1, 1, 1, 3, 1],
        [1, 1, 1, 1, 1]
    ];
    // LEVEL 2: Avoiding one black hole
    const LEVEL_2 = [
        [1, 1, 1, 1, 1],
        [2, 0, 0, 1, 1],
        [1, 4, 0, 0, 3],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1]
    ];
    // LEVEL 3: Winding path
    const LEVEL_3 = [
        [1, 2, 0, 1, 1],
        [1, 1, 0, 0, 1],
        [1, 4, 1, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 3, 1, 1, 1]
    ];

    const currentMap = level === 1 ? LEVEL_1 : level === 2 ? LEVEL_2 : LEVEL_3;
    const gridSize = 5;

    // Init Level
    useEffect(() => {
        // Find start pos
        for(let y=0; y<gridSize; y++) {
            for(let x=0; x<gridSize; x++) {
                if (currentMap[y][x] === 2) {
                    setPos({ x, y });
                    // Default facing right
                    setDir(1);
                }
            }
        }
    }, [level]);

    const tryMove = (newDir: number) => {
        setDir(newDir); // Always rotate to face direction
        
        let newX = pos.x;
        let newY = pos.y;
        
        if (newDir === 0) newY--; // Up
        if (newDir === 1) newX++; // Right
        if (newDir === 2) newY++; // Down
        if (newDir === 3) newX--; // Left

        // Check bounds
        if (newX < 0 || newX >= gridSize || newY < 0 || newY >= gridSize) {
             onFeedback("Duvara çarptık!", "error");
             return;
        }

        const cell = currentMap[newY][newX];
        if (cell === 1) { // Wall
             onFeedback("Duvar var, geçemeyiz!", "error");
             return;
        }
        
        // Move valid
        if (cell === 4) { // Black Hole
             onFeedback("Olamaz! Kara delik! Başa dönüyoruz.", "error");
             // Reset to start
             for(let y=0; y<gridSize; y++) {
                 for(let x=0; x<gridSize; x++) {
                     if (currentMap[y][x] === 2) {
                         setPos({ x, y });
                         setDir(1);
                     }
                 }
             }
        } else if (cell === 3) { // Exit
             setPos({ x: newX, y: newY });
             if (level < 3) {
                 onFeedback("Çıkışı buldun! Harika!", "success");
                 setTimeout(() => setLevel(l => l + 1), 1500);
             } else {
                 onFeedback("Labirentten kaçtık! Süpersin!", "success");
                 onFinish();
             }
        } else {
             // Normal step
             setPos({ x: newX, y: newY });
             onFeedback("İleri!", "neutral");
        }
    };

    const renderCell = (x: number, y: number, cellType: number) => {
        const isPlayer = pos.x === x && pos.y === y;
        
        let cellContent = null;
        
        // Base cell style (Space Dust)
        const baseClass = "relative w-full aspect-square flex items-center justify-center border border-white/5";

        if (cellType === 1) { // Wall (Asteroid Style)
            cellContent = (
                <div className="w-full h-full scale-90 rounded-lg bg-gradient-to-br from-slate-500 to-slate-800 shadow-[inset_-2px_-2px_4px_rgba(0,0,0,0.6),inset_2px_2px_4px_rgba(255,255,255,0.1)] relative overflow-hidden">
                    {/* Craters */}
                    <div className="absolute top-1 left-1 w-2 h-2 bg-black/20 rounded-full shadow-inner"></div>
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-black/30 rounded-full shadow-inner"></div>
                    <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-black/10 rounded-full shadow-inner"></div>
                </div>
            );
        } else if (cellType === 4) { // Black Hole
            cellContent = (
                <div className="w-full h-full flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-purple-900/40 blur-md rounded-full"></div>
                    <Disc className="text-black animate-spin duration-[3000ms]" size={32} />
                </div>
            );
        } else if (cellType === 3) { // Exit
            cellContent = <Flag className="text-green-400 drop-shadow-[0_0_8px_rgba(74,222,128,0.8)]" size={32} />;
        } else if (cellType === 2) { // Start
            cellContent = <div className="w-2 h-2 bg-blue-500/50 rounded-full animate-pulse"></div>;
        } else {
            // Empty Path with Space Dust/Stars
            cellContent = (
                <div className="w-1 h-1 bg-white/20 rounded-full shadow-[0_0_4px_rgba(255,255,255,0.5)]"></div>
            );
        }

        return (
            <div key={`${x}-${y}`} className={baseClass}>
                {cellContent}
                {isPlayer && (
                    <motion.div 
                        layoutId="player"
                        // Rotate logic: 
                        // Icon default is 45deg (Top-Right). 
                        // To face Up (0 deg), we need -45deg.
                        // So transform is dir * 90 - 45.
                        animate={{ rotate: dir * 90 - 45 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute z-10 text-white drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                    >
                        <Rocket size={40} fill="white" className="text-blue-500" />
                    </motion.div>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 w-full max-w-5xl p-4">
            {/* Left: Game Board */}
            <div className="bg-slate-900/80 p-6 rounded-[2rem] border-4 border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.15)] relative overflow-hidden backdrop-blur-sm">
                {/* Space Background Pattern */}
                <div className="absolute inset-0 opacity-20 pointer-events-none" 
                     style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
                </div>
                
                <div 
                    className="grid gap-1 relative z-10"
                    style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)`, width: 'min(80vw, 350px)' }}
                >
                    {currentMap.map((row, y) => 
                        row.map((cell, x) => renderCell(x, y, cell))
                    )}
                </div>
            </div>

            {/* Right: Controls (D-PAD Layout) */}
            <div className="bg-slate-800 p-8 rounded-[2.5rem] border-t-4 border-b-4 border-slate-600 shadow-2xl flex flex-col items-center gap-6 min-w-[240px]">
                <div className="text-cyan-400 font-mono text-xs font-bold tracking-[0.2em] flex items-center gap-2 mb-2">
                     <Radio size={14} className="animate-pulse" /> KONTROL PANELİ
                </div>

                <div className="grid grid-cols-3 gap-3 w-full max-w-[200px]">
                    {/* UP (Col 2) */}
                    <div className="col-start-2">
                        <button 
                            onClick={() => tryMove(0)}
                            className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 active:translate-y-1 shadow-[0_6px_0_rgb(30,58,138),0_10px_10px_rgba(0,0,0,0.3)] text-white w-16 h-16 rounded-2xl flex items-center justify-center border-t border-white/20 transition-all"
                        >
                            <ArrowUp size={32} strokeWidth={3} />
                        </button>
                    </div>
                    
                    {/* LEFT (Col 1) */}
                    <div className="col-start-1">
                         <button 
                            onClick={() => tryMove(3)}
                            className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 active:translate-y-1 shadow-[0_6px_0_rgb(30,58,138),0_10px_10px_rgba(0,0,0,0.3)] text-white w-16 h-16 rounded-2xl flex items-center justify-center border-t border-white/20 transition-all"
                        >
                            <ArrowLeft size={32} strokeWidth={3} />
                        </button>
                    </div>

                    {/* RIGHT (Col 3) */}
                    <div className="col-start-3">
                         <button 
                            onClick={() => tryMove(1)}
                            className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 active:translate-y-1 shadow-[0_6px_0_rgb(30,58,138),0_10px_10px_rgba(0,0,0,0.3)] text-white w-16 h-16 rounded-2xl flex items-center justify-center border-t border-white/20 transition-all"
                        >
                            <ArrowRight size={32} strokeWidth={3} />
                        </button>
                    </div>

                    {/* DOWN (Col 2) */}
                    <div className="col-start-2">
                         <button 
                            onClick={() => tryMove(2)}
                            className="bg-gradient-to-b from-blue-400 to-blue-600 hover:from-blue-300 hover:to-blue-500 active:translate-y-1 shadow-[0_6px_0_rgb(30,58,138),0_10px_10px_rgba(0,0,0,0.3)] text-white w-16 h-16 rounded-2xl flex items-center justify-center border-t border-white/20 transition-all"
                        >
                            <ArrowDown size={32} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- 9. PLUTO: Şifre Çözücü (Code Breaker) ---
const PlutoGame: React.FC<GameProps> = ({ onFinish, onFeedback }) => {
    const [round, setRound] = useState(1);
    const [clues, setClues] = useState<{ icons: string[], code: string }[]>([]);
    const [question, setQuestion] = useState<{ icons: string[], answer: string } | null>(null);
    const [options, setOptions] = useState<string[]>([]);
  
    const ICONS = ['🍎', '🚀', '⭐', '🐶', '🚗', '🎈', '🍕', '⚽'];
    
    useEffect(() => {
        generateLevel();
    }, [round]);
  
    const generateLevel = () => {
        // 1. Select 3 unique icons for this round
        const roundIcons = [...ICONS].sort(() => Math.random() - 0.5).slice(0, 3);
        
        // 2. Assign values (1, 2, 3) to them randomly
        const values = [1, 2, 3];
        // mapping: { '🍎': 1, '🚀': 2 ... }
        const mapping: Record<string, number> = {};
        roundIcons.forEach((icon, i) => mapping[icon] = values[i]);
  
        // 3. Generate Clues
        // We need 3 clues. Each secret icon MUST appear at least once in the clues.
        const newClues = [];
        
        // Strategy: 
        // Clue 1: A B C (All three)
        // Clue 2: A A B
        // Clue 3: C B A
        // This guarantees all are seen.
        const combinations = [
            [roundIcons[0], roundIcons[1], roundIcons[2]],
            [roundIcons[0], roundIcons[0], roundIcons[1]],
            [roundIcons[2], roundIcons[1], roundIcons[0]]
        ];
  
        // Shuffle combinations order
        combinations.sort(() => Math.random() - 0.5);
  
        for (const combo of combinations) {
            const code = combo.map(icon => mapping[icon]).join('');
            newClues.push({ icons: combo, code });
        }
        
        setClues(newClues);
  
        // 4. Generate Question
        // Must use all 3 icons exactly once (Permutation), distinct from clues if possible
        let perm = [...roundIcons].sort(() => Math.random() - 0.5);
        
        const answer = perm.map(icon => mapping[icon]).join('');
        setQuestion({ icons: perm, answer });
  
        // 5. Generate Options
        const opts = new Set<string>();
        opts.add(answer);
        while (opts.size < 3) {
            // Random 3 digit from 1,2,3
            const r = Array.from({length: 3}, () => Math.ceil(Math.random() * 3)).join('');
            if (r !== answer) opts.add(r);
        }
        setOptions(Array.from(opts).sort());
    };
  
    const handleAnswer = (opt: string) => {
        if (question && opt === question.answer) {
            onFeedback(getRandomPraise(), 'success');
            if (round < 3) {
                setTimeout(() => setRound(r => r + 1), 1000);
            } else {
                onFinish();
            }
        } else {
            onFeedback("Yanlış şifre. İpuçlarına dikkat et!", 'error');
        }
    };
  
    if (!question) return null;
  
    return (
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl items-center justify-center">
            {/* Clues Panel (Left) */}
            <div className="bg-slate-800 p-6 rounded-3xl border-4 border-slate-600 shadow-xl flex-1 w-full max-w-sm">
                <h3 className="text-blue-300 font-bold mb-4 flex items-center gap-2">
                    <Key size={20} /> ŞİFRE İPUÇLARI
                </h3>
                <div className="space-y-4">
                    {clues.map((clue, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-slate-900/50 p-3 rounded-xl border border-white/5">
                            <div className="text-2xl tracking-widest">{clue.icons.join(' ')}</div>
                            <ArrowRight size={20} className="text-slate-500" />
                            <div className="text-2xl font-mono text-green-400 tracking-widest">{clue.code}</div>
                        </div>
                    ))}
                </div>
            </div>
  
            {/* Question Panel (Right) */}
            <div className="flex-1 w-full max-w-sm flex flex-col items-center gap-6">
                 <div className="bg-slate-900 p-8 rounded-[2rem] border-4 border-yellow-400 shadow-[0_0_30px_rgba(250,204,21,0.3)] w-full text-center">
                      <div className="text-sm text-yellow-500 font-bold mb-2 uppercase tracking-widest">GİZLİ ŞİFRE NE?</div>
                      <div className="text-5xl mb-4 py-4">{question.icons.join(' ')}</div>
                      <div className="flex justify-center gap-2">
                          {[1, 2, 3].map(i => <div key={i} className="w-12 h-12 bg-slate-800 rounded-lg animate-pulse"></div>)}
                      </div>
                 </div>
  
                 <div className="grid grid-cols-3 gap-4 w-full">
                      {options.map(opt => (
                          <button
                              key={opt}
                              onClick={() => handleAnswer(opt)}
                              className="bg-white text-slate-900 text-2xl font-bold py-4 rounded-xl shadow-[0_4px_0_#cbd5e1] active:shadow-none active:translate-y-1 transition-all"
                          >
                              {opt}
                          </button>
                      ))}
                 </div>
            </div>
        </div>
    );
};