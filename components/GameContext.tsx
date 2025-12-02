import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { GameState, Character, CharacterId, Planet, PlanetId } from '../types';
import { speakText } from '../services/geminiService';


const INITIAL_PLANETS: Planet[] = [
  { id: PlanetId.MERCURY, name: 'Merkür', color: '#fbbf24', isUnlocked: true, stars: 0, description: 'Sıcak ve Hızlı!' },
  { id: PlanetId.VENUS, name: 'Venüs', color: '#f97316', isUnlocked: false, stars: 0, description: 'Parlak Gezegen' },
  { id: PlanetId.EARTH, name: 'Dünya', color: '#3b82f6', isUnlocked: false, stars: 0, description: 'Evimiz' },
  { id: PlanetId.MARS, name: 'Mars', color: '#ef4444', isUnlocked: false,stars: 0, description: 'Kızıl Gezegen' },
  { id: PlanetId.JUPITER, name: 'Jüpiter', color: '#d97706', isUnlocked: false, stars: 0, description: 'Dev Gezegen' },
  { id: PlanetId.SATURN, name: 'Satürn', color: '#eab308', isUnlocked: false, stars: 0, description: 'Halkalı Güzel' },
  { id: PlanetId.URANUS, name: 'Uranüs', color: '#06b6d4', isUnlocked: false, stars: 0, description: 'Buz Devi' },
  { id: PlanetId.NEPTUNE, name: 'Neptün', color: '#3b82f6', isUnlocked: false, stars: 0, description: 'Rüzgarlı Mavi' },
  { id: PlanetId.PLUTO, name: 'Plüton', color: '#a8a29e', isUnlocked: false, stars: 0, description: 'Küçük Dost' },
];


const STATIC_CHARACTER_IMAGES: Record<string, string> = {
  // Mimi: Pink Astronaut Theme
  [CharacterId.MIMI]: "https://i.pinimg.com/736x/1e/22/d4/1e22d417c0e8f69c7b92a40be044484f.jpg", 
  // Roko: Blue Astronaut Theme
  [CharacterId.ROKO]: "https://i.pinimg.com/736x/42/a0/ee/42a0eef31098c3fc2b9fe815936ca36d.jpg", 
  // Coco: Orange Cat / Fox Theme
  [CharacterId.COCO]: "https://i.pinimg.com/736x/33/84/e8/3384e84c8dc22ba7011f0814ade99197.jpg", 
  // Titi: Robot Theme
  [CharacterId.TITI]: "https://i.pinimg.com/1200x/10/6d/5c/106d5c8df0612ae33b4301e807b3222e.jpg"  
};


const CHARACTERS: Character[] = [
  // Mimi: Pink Astronaut
  { id: CharacterId.MIMI, name: 'Mimi', color: 'bg-pink-500', description: 'Pembe Astronot', greeting: 'Merhaba! Ben Mimi. Hadi uzayı pembe renge boyayalım!', voiceName: 'Kore', imageUrl: STATIC_CHARACTER_IMAGES[CharacterId.MIMI] },
  // Roko: Blue Astronaut
  { id: CharacterId.ROKO, name: 'Roko', color: 'bg-blue-600', description: 'Mavi Astronot', greeting: 'Selam! Ben Roko. Mavi gezegenleri keşfetmeye hazır mısın?', voiceName: 'Fenrir', imageUrl: STATIC_CHARACTER_IMAGES[CharacterId.ROKO] },
  // Coco: Cat Astronaut
  { id: CharacterId.COCO, name: 'Coco', color: 'bg-orange-500', description: 'Kedi Astronot', greeting: 'Miyav! Ben Coco. Uzayda süt var mı acaba?', voiceName: 'Puck', imageUrl: STATIC_CHARACTER_IMAGES[CharacterId.COCO] },
  // Titi: Robot Astronaut
  { id: CharacterId.TITI, name: 'Titi', color: 'bg-yellow-500', description: 'Robot Astronot', greeting: 'Bip bip! Ben Titi. Sistemler hazır, uçuşa geçiyoruz!', voiceName: 'Zephyr', imageUrl: STATIC_CHARACTER_IMAGES[CharacterId.TITI] },
];

// Planet Intros centralized for Preloading
export const PLANET_INTROS: Record<string, string> = {
    [PlanetId.MERCURY]: "Merkür çok sıcak! Kırmızı meteorlara sakın dokunma, sadece mavi taşları topla.",
    [PlanetId.VENUS]: "Venüs'ün müziğini dinle. Renkler hangi sırayla yandıysa, sen de aynısını yap.",
    [PlanetId.EARTH]: "Dünya'nın resmi karışmış! Parçaları sağdaki kutudan al ve doğru yerlere koyarak resmi tamamla.",
    [PlanetId.MARS]: "Mars'ta kaç tane yıldız var? Sayılarına dikkat et ve doğru cevabı seç.",
    [PlanetId.JUPITER]: "Jüpiter'de hafıza oyunu! Kartları çevir ve aynı resimleri eşleştir.",
    [PlanetId.SATURN]: "Satürn'ün halkasındaki deseni görüyor musun? Sırada hangi şekil olmalı?",
    [PlanetId.URANUS]: "Uranüs'te köstebek yakalamaca! Karakterler deliklerden çıkınca hemen üzerlerine dokun.",
    [PlanetId.NEPTUNE]: "Neptün labirentinde kaybolmadan çıkışı bul. Ok tuşlarını kullanarak roketi yönet.",
    [PlanetId.PLUTO]: "Plüton'un şifresini çözelim. İpuçlarına bak, hangi sembol hangi sayıymış bul.",
};

const COMMON_FEEDBACK = [
    "Harikasın küçük astronot!",
    "Süper gidiyorsun!",
    "İşte böyle!",
    "Müthisşin!",
    "Çok akıllısın!",
    "Yıldızlar kadar parlaksın!",
    "Bir daha deneyelim mi?",
    "Az kaldı, tekrar dene!",
    "Pes etmek yok, başarabilirsin!",
    "Dikkatli bak, bulabilirsin.",
    "Doğru!",
    "Hata oldu, dikkatli izle!",
    "Harika!",
    "Temizlendi!",
    "Süper!"
];

interface AudioRequest {
    text: string;
    voiceOverride?: string;
    options?: { priority?: boolean };
}

interface SfxOptions {
    frequency?: number;
}

interface GameContextType {
  state: GameState;
  selectCharacter: (id: CharacterId) => void;
  unlockNextPlanet: (currentPlanetId: PlanetId) => void;
  playVoice: (text: string, voiceOverride?: string, options?: { priority?: boolean }) => void;
  stopAudio: () => void;
  pauseAudio: () => void;
  resumeAudio: () => void;
  playSfx: (type: 'success' | 'error' | 'click' | 'pop' | 'tone', options?: SfxOptions) => void;
  isSpeaking: boolean;
  setCurrentPlanet: (id: PlanetId | null) => void;
  addStars: (planetId: PlanetId, count: number) => void;
  availableCharacters: Character[];
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const decodePCM = (buffer: ArrayBuffer, ctx: AudioContext): AudioBuffer => {
  if (!buffer || buffer.byteLength === 0) throw new Error("Empty audio buffer");
  
  // Ensure we have an even number of bytes for 16-bit PCM
  if (buffer.byteLength % 2 !== 0) {
      buffer = buffer.slice(0, buffer.byteLength - 1);
  }

  const pcm16 = new Int16Array(buffer);
  const sampleRate = 24000; 
  const audioBuffer = ctx.createBuffer(1, pcm16.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  
  for (let i = 0; i < pcm16.length; i++) {
    channelData[i] = pcm16[i] / 32768.0;
  }
  return audioBuffer;
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    selectedCharacter: null,
    planets: INITIAL_PLANETS,
    currentPlanet: null,
    totalStars: 0,
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const audioCache = useRef<Map<string, AudioBuffer>>(new Map());
  const pendingRequests = useRef<Map<string, Promise<any>>>(new Map());
  const activeSource = useRef<AudioBufferSourceNode | null>(null);
  const audioQueue = useRef<AudioRequest | null>(null);

  const playSfx = (type: 'success' | 'error' | 'click' | 'pop' | 'tone', options: SfxOptions = {}) => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
    }
    if (!audioContext) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    const now = audioContext.currentTime;

    if (type === 'tone' && options.frequency) {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(options.frequency, now);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'success') {
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
    } else if (type === 'pop') {
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.1);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    } else { // click
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
    }
  };

  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    setAudioContext(ctx);
    const resumeAudio = () => { if (ctx.state === 'suspended') ctx.resume(); };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);

    const processItem = ({ text, voice }: { text: string, voice: string }): Promise<void> => {
        const cacheKey = `${text}-${voice}`;
        if (audioCache.current.has(cacheKey)) return Promise.resolve();
        if (pendingRequests.current.has(cacheKey)) return pendingRequests.current.get(cacheKey)!;

        const promise = speakText(text, voice).then(buffer => {
            if (buffer && ctx) {
                try {
                    const audioBuffer = decodePCM(buffer, ctx);
                    audioCache.current.set(cacheKey, audioBuffer);
                } catch (e) {
                    console.error("Failed to decode PCM for preload:", text, e);
                }
            }
        }).catch(e => {
            console.warn("Preload failed for:", text, e);
        }).finally(() => {
            pendingRequests.current.delete(cacheKey);
        });
        
        pendingRequests.current.set(cacheKey, promise);
        return promise;
    };

    const preload = async () => {
        // PRIORITY 1: Fire all character greeting requests concurrently for maximum speed.
        const characterGreetings = CHARACTERS.map(c => ({ text: c.greeting, voice: c.voiceName }));
        const greetingPromises = characterGreetings.map(processItem);
        await Promise.all(greetingPromises);
        console.log("All character greetings have been preloaded concurrently.");

        // PRIORITY 2: Load other sounds in batches to avoid overwhelming the API.
        const otherSounds = [
            ...Object.values(PLANET_INTROS).map(text => ({ text, voice: 'Kore' })),
            ...COMMON_FEEDBACK.map(text => ({ text, voice: 'Kore' })),
            { text: "Bu gezegen henüz kilitli. Önce diğerlerini tamamla!", voice: 'Kore' }
        ];
        
        let index = 0;
        const batchSize = 3;
        const processBatch = () => {
            if (index >= otherSounds.length) return;
            const batch = otherSounds.slice(index, index + batchSize);
            batch.forEach(processItem);
            index += batchSize;
            setTimeout(processBatch, 1000); // Process next batch after 1s
        };
        
        processBatch();
    };

    preload();
    
    return () => {
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
        ctx.close();
    }
  }, []);

  const playNextInQueue = () => {
    if (audioQueue.current) {
        const { text, voiceOverride, options } = audioQueue.current;
        audioQueue.current = null;
        playVoice(text, voiceOverride, options);
    }
  };
  
  const stopAudio = () => {
    if (activeSource.current) {
        try { activeSource.current.stop(); } catch(e) {}
        activeSource.current.onended = null;
        activeSource.current = null;
    }
    audioQueue.current = null;
    setIsSpeaking(false);
  };
  
  const pauseAudio = () => {
    if (audioContext && audioContext.state === 'running') {
        audioContext.suspend();
    }
  };

  const resumeAudio = () => {
    if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
    }
  };

  const playVoice = async (text: string, voiceOverride?: string, options: { priority?: boolean } = {}) => {
    if (!audioContext) return;
    if (isSpeaking && !options.priority) {
        audioQueue.current = { text, voiceOverride, options };
        return;
    }
    if (isSpeaking && options.priority) {
        stopAudio();
    }

    let voiceName = state.selectedCharacter?.voiceName || 'Kore';
    if (voiceOverride) {
        voiceName = voiceOverride;
    }
    const cacheKey = `${text}-${voiceName}`;

    try {
      let audioBuffer: AudioBuffer;
      if (audioCache.current.has(cacheKey)) {
        audioBuffer = audioCache.current.get(cacheKey)!;
      } else {
        let buffer: ArrayBuffer | null;
        if (pendingRequests.current.has(cacheKey)) {
            await pendingRequests.current.get(cacheKey)!;
            // Now it should be in the cache
            if (audioCache.current.has(cacheKey)) {
                 audioBuffer = audioCache.current.get(cacheKey)!;
            } else {
                 throw new Error("Preload promise resolved but audio not in cache");
            }
        } else {
            const reqPromise = speakText(text, voiceName);
            pendingRequests.current.set(cacheKey, reqPromise);
            buffer = await reqPromise;
            pendingRequests.current.delete(cacheKey);

            if (buffer) {
              try {
                audioBuffer = decodePCM(buffer, audioContext);
                audioCache.current.set(cacheKey, audioBuffer);
              } catch(decodeErr) {
                console.error("PCM Decode Error:", decodeErr);
                return;
              }
            } else {
               return;
            }
        }
      }

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.onended = () => {
        if (activeSource.current === source) {
            activeSource.current = null;
            setIsSpeaking(false);
            playNextInQueue();
        }
      };
      
      activeSource.current = source;
      setIsSpeaking(true);
      source.start(0);

    } catch (e) {
      console.error("Audio playback error", e);
      setIsSpeaking(false);
    }
  };

  const selectCharacter = (id: CharacterId) => {
    const char = CHARACTERS.find(c => c.id === id);
    if (char) {
      setState(prev => ({ ...prev, selectedCharacter: char }));
      playVoice(char.greeting, char.voiceName, { priority: true });
    }
  };

  const setCurrentPlanet = (id: PlanetId | null) => {
    setState(prev => ({ ...prev, currentPlanet: id }));
  };

  const unlockNextPlanet = (currentPlanetId: PlanetId) => {
    setState(prev => {
        const currentIndex = prev.planets.findIndex(p => p.id === currentPlanetId);
        if (currentIndex >= 0 && currentIndex < prev.planets.length - 1) {
            const nextPlanetIndex = currentIndex + 1;
            if (!prev.planets[nextPlanetIndex].isUnlocked) {
                const updatedPlanets = [...prev.planets];
                updatedPlanets[nextPlanetIndex] = { ...updatedPlanets[nextPlanetIndex], isUnlocked: true };
                return { ...prev, planets: updatedPlanets };
            }
        }
        return prev;
    });
  };

  const addStars = (planetId: PlanetId, count: number) => {
    setState(prev => {
        const updatedPlanets = prev.planets.map(p => {
            if (p.id === planetId) {
                return { ...p, stars: Math.max(p.stars, count) };
            }
            return p;
        });
        const totalStars = updatedPlanets.reduce((acc, p) => acc + p.stars, 0);
        return { ...prev, planets: updatedPlanets, totalStars };
    });
  };

  return (
    <GameContext.Provider value={{ 
      state, 
      selectCharacter, 
      playVoice,
      stopAudio,
      pauseAudio,
      resumeAudio,
      playSfx,
      isSpeaking, 
      setCurrentPlanet, 
      unlockNextPlanet,
      addStars,
      availableCharacters: CHARACTERS 
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error("useGame must be used within GameProvider");
  return context;
};