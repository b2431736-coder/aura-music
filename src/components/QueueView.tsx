import React from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { X, GripVertical, Trash2, Music, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InteractiveText } from './InteractiveText';

interface QueueViewProps {
  onClose: () => void;
}

export function QueueView({ onClose }: QueueViewProps) {
  const { playlist, currentTrack, removeFromQueue, reorderQueue, playTrack, isPlaying } = usePlayer();

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderQueue(index, index - 1);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < playlist.length - 1) {
      reorderQueue(index, index + 1);
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 w-full md:w-[400px] h-full bg-[#0a0a0a]/95 backdrop-blur-3xl border-l border-white/10 z-[70] shadow-[-20px_0_50px_rgba(0,0,0,0.5)] flex flex-col"
    >
      {/* Header */}
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <Music className="text-accent" />
            <InteractiveText text="Up Next" />
          </h2>
          <p className="text-text-dim text-xs uppercase tracking-[3px] font-bold mt-1">
            {playlist.length} Tracks in Queue
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-accent transition-all hover:scale-110 active:scale-95"
        >
          <X size={20} />
        </button>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        <div className="px-4 space-y-2">
          <AnimatePresence mode="popLayout">
            {playlist.map((track, index) => {
              const isCurrent = currentTrack?.id === track.id;
              
              return (
                <motion.div
                  key={track.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group relative flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 ${isCurrent ? 'bg-accent/10 border border-accent/20' : 'hover:bg-white/5 border border-transparent'}`}
                >
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 shadow-lg">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    {isCurrent && isPlaying && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex gap-0.5 items-end h-3">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ height: [4, 12, 6, 12, 4] }}
                              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                              className="w-1 bg-accent rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    {!isCurrent && (
                      <button 
                        onClick={() => playTrack(track)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                      >
                        <Play size={16} className="text-white fill-white" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-12">
                    <h4 className={`text-[14px] font-bold truncate ${isCurrent ? 'text-accent' : 'text-white'}`}>
                      {track.title}
                    </h4>
                    <p className="text-text-dim text-[12px] truncate">{track.artist}</p>
                  </div>

                  {/* Actions Overlay */}
                  <div className="absolute right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-1">
                      <button 
                        disabled={index === 0}
                        onClick={() => handleMoveUp(index)}
                        className="text-white/40 hover:text-white disabled:opacity-0 transition-colors pt-0.5"
                      >
                        <GripVertical size={14} className="rotate-0" />
                      </button>
                    </div>
                    
                    <button 
                      onClick={() => removeFromQueue(track.id)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Remove from queue"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {isCurrent && !isPlaying && (
                    <div className="absolute right-4 text-[10px] uppercase font-black tracking-widest text-accent/60 italic">
                      Paused
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-8 bg-white/[0.02] border-t border-white/5">
        <div className="flex items-center gap-4 text-xs font-bold text-text-dim uppercase tracking-widest">
          <div className="flex-1 h-[1px] bg-white/10" />
          <span>End of Queue</span>
          <div className="flex-1 h-[1px] bg-white/10" />
        </div>
      </div>
    </motion.div>
  );
}
