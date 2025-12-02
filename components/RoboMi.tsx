import React, { useEffect } from 'react';
import { useGame } from './GameContext';
import { motion } from 'framer-motion';
import { Bot } from 'lucide-react';

interface RoboMiProps {
  message?: string;
  triggerVoice?: boolean;
}

export const RoboMi: React.FC<RoboMiProps> = ({ message, triggerVoice }) => {
  const { isSpeaking, playVoice } = useGame();

  useEffect(() => {
    if (message && triggerVoice) {
      playVoice(message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message, triggerVoice]);

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-end gap-2 pointer-events-none">
      <motion.div
        animate={isSpeaking ? { y: [0, -10, 0], scale: [1, 1.1, 1] } : {}}
        transition={{ repeat: isSpeaking ? Infinity : 0, duration: 0.5 }}
        className="bg-white text-indigo-900 p-3 rounded-full shadow-lg border-4 border-blue-400 w-20 h-20 flex items-center justify-center relative"
      >
        <Bot size={40} />
        {isSpeaking && (
           <span className="absolute -top-1 -right-1 flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
             <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
           </span>
        )}
      </motion.div>
    </div>
  );
};
