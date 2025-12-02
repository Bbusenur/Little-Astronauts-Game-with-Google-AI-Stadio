import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './components/GameContext';
import { SolarSystem } from './components/SolarSystem';
import { GameContainer } from './components/Games';
import { CharacterId } from './types';
import { motion } from 'framer-motion';
import { RoboMi } from './components/RoboMi';
import { Rocket, Loader2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { state, selectCharacter, playVoice, playSfx, availableCharacters } = useGame();

  const handleSelectCharacter = (id: CharacterId) => {
    playSfx('click'); // INSTANT FEEDBACK
    selectCharacter(id);
  };

  // Screen 1: Character Selection
  if (!state.selectedCharacter) {
    return (
      <div className="h-screen bg-slate-900 flex flex-col items-center justify-center p-2 md:p-4 relative overflow-hidden star-bg">
        <h1 className="text-3xl md:text-5xl font-bold text-yellow-400 mb-4 md:mb-6 text-center drop-shadow-lg tracking-wider">
            Minik Astronotlar
        </h1>
        <h2 className="text-xl md:text-2xl text-blue-200 mb-6 md:mb-8 font-bold bg-slate-800/60 px-6 py-2 rounded-full border border-blue-400/30 backdrop-blur-sm">
            Kahramanını Seç!
        </h2>
        
        <div className="grid grid-cols-2 gap-4 md:gap-8 max-w-4xl w-full px-2 md:px-4">
          {availableCharacters.map((char) => (
            <motion.button
              key={char.id}
              whileHover={{ scale: 1.05, translateY: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleSelectCharacter(char.id)}
              className={`${char.color} relative p-1 rounded-[2rem] shadow-2xl group transition-all duration-300 w-full max-w-[300px] mx-auto`}
            >
              {/* Card Body */}
              <div className="bg-gradient-to-br from-white/20 to-black/10 h-full w-full rounded-[1.8rem] p-4 md:p-6 flex flex-col items-center gap-2 md:gap-4 border border-white/20 backdrop-blur-sm relative overflow-hidden">
                  
                  {/* Glossy Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none"></div>

                  {/* 3D Avatar Container */}
                  <div className="w-20 h-20 md:w-28 md:h-28 rounded-full shadow-[0_10px_20px_rgba(0,0,0,0.3),inset_0_-5px_10px_rgba(0,0,0,0.2)] relative flex items-center justify-center bg-white border-4 border-white/50 overflow-hidden shrink-0">
                      
                      {/* Avatar Image */}
                      <img 
                        src={char.imageUrl} 
                        alt={char.name} 
                        className="w-full h-full object-cover object-top transform group-hover:scale-110 transition-transform duration-500"
                      />
                  </div>

                  {/* Text Info */}
                  <div className="text-center relative z-10">
                    <div className="text-xl md:text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] tracking-wide">{char.name}</div>
                    <div className="text-white/90 text-xs md:text-sm font-bold bg-black/20 px-2 py-1 md:px-3 rounded-full mt-1 md:mt-2 inline-block border border-white/10 shadow-sm whitespace-nowrap">
                        {char.description}
                    </div>
                  </div>
              </div>
              
              {/* Bottom Shadow/Platform effect */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/30 rounded-[100%] blur-md group-hover:w-[90%] group-hover:bg-black/40 transition-all"></div>
            </motion.button>
          ))}
        </div>

        <div className="mt-8 md:mt-12">
             <RoboMi message="Merhaba! Ben RoboMi. Başlamak için bir arkadaş seç." triggerVoice={true} />
        </div>
      </div>
    );
  }

  // Screen 3: Mini Game
  if (state.currentPlanet) {
    return <GameContainer />;
  }

  // Screen 2: Solar System Map
  return (
    <>
      <SolarSystem />
      <RoboMi message="Gitmek istediğin gezegene dokun!" triggerVoice={false} />
    </>
  );
};

const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

export default App;