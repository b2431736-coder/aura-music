import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '../contexts/PlayerContext';
import { Info, CheckCircle2 } from 'lucide-react';

export function FloatingNotification() {
  const { notification, currentTrack } = usePlayer();

  return (
    <div className="fixed top-6 left-0 right-0 flex justify-center z-[100] pointer-events-none">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.8 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              width: 'auto',
              minWidth: '200px'
            }}
            exit={{ opacity: 0, y: -40, scale: 0.8 }}
            transition={{ type: 'spring', damping: 18, stiffness: 250 }}
            className="flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-[30px] border border-white/10 rounded-full pointer-events-auto shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} className="text-white" />
            </div>
            <div className="flex flex-col pr-2">
              <span className="text-[13px] font-bold text-white whitespace-nowrap">{notification}</span>
              {currentTrack && (
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-black leading-none mt-0.5">
                  Dynamic Island Pro
                </span>
              )}
            </div>
            
            {/* Pulsing indicator - futuristic detail */}
            <div className="relative w-2 h-2 mr-1">
               <div className="absolute inset-0 bg-accent rounded-full animate-ping opacity-40"></div>
               <div className="absolute inset-1 bg-accent rounded-full"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
