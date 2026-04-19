import React, { useRef, useState, useEffect } from 'react';
import { usePlayer, EQ_PROFILES } from '../contexts/PlayerContext';
import { Play, Pause, SkipBack, SkipForward, Volume2, Volume1, VolumeX, Shuffle, Repeat, SlidersHorizontal, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InteractiveText } from './InteractiveText';

export function PlayerControls() {
  const { 
    currentTrack, isPlaying, progress, volume, eqProfile, dimensionalMode,
    showLyrics, showQueue, toggleLyrics, toggleQueue, togglePlayPause, nextTrack, prevTrack, seek, 
    setVolume, setEqProfile, setDimensionalMode 
  } = usePlayer();
  const [prevVolume, setPrevVolume] = useState(0.8);
  const [showEq, setShowEq] = useState(false);
  
  const progressRef = useRef<HTMLDivElement>(null);
  const volumeRef = useRef<HTMLDivElement>(null);
  const eqMenuRef = useRef<HTMLDivElement>(null);

  // Close EQ menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (eqMenuRef.current && !eqMenuRef.current.contains(event.target as Node)) {
        setShowEq(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentTrack) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTime = progress * currentTrack.duration;

  const handleProgressDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    seek(Math.max(0, Math.min(1, x / rect.width)));
  };

  const handleProgressPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    handleProgressDrag(e);
  };

  const handleVolumeDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!volumeRef.current) return;
    const rect = volumeRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    setVolume(Math.max(0, Math.min(1, x / rect.width)));
  };

  const handleVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    handleVolumeDrag(e);
  };

  const toggleMute = () => {
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.8);
    }
  };

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 z-[60] pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentTrack.id}
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-[1100px] h-[80px] mx-auto bg-black/40 backdrop-blur-[40px] border border-white/10 rounded-[40px] flex pointer-events-auto transition-all shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] hover:border-white/20 hover:bg-black/50 group relative"
        >
          {/* Dynamic Background Gradient (Apple Music Style) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            key={`bg-${currentTrack.id}`}
            className={`absolute inset-0 bg-gradient-to-r ${currentTrack.colorClass} z-0 pointer-events-none transition-all duration-1000 rounded-[40px]`}
          />
          
          <div className="w-full h-full flex items-center justify-between px-8 z-10 relative">
          
          {/* Track Info */}
          <div className="flex items-center gap-4 w-[280px]">
            <motion.img 
              key={currentTrack.coverUrl}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              src={currentTrack.coverUrl} 
              alt={currentTrack.title} 
              className="w-14 h-14 rounded-md object-cover shadow-[0_8px_24px_rgba(250,36,60,0.3)] bg-accent"
            />
            <div className="overflow-hidden">
              <motion.h4 
                key={`title-${currentTrack.id}`}
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-text-main font-semibold text-[14px] truncate leading-tight mb-0.5"
              >
                <InteractiveText text={currentTrack.title} mode="word" active />
              </motion.h4>
              <p className="text-text-dim text-[12px] truncate"><InteractiveText text={currentTrack.artist} /></p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center flex-1 max-w-[500px] gap-2">
            <div className="flex items-center gap-8">
              <button className="text-text-dim hover:text-text-main transition-colors">
                <Shuffle size={16} />
              </button>
              <button onClick={prevTrack} className="text-text-main hover:opacity-80 transition-opacity">
                <SkipBack size={20} fill="currentColor" />
              </button>
              
              <button 
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-text-main text-black flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-0.5" />}
              </button>

              <button onClick={nextTrack} className="text-text-main hover:opacity-80 transition-opacity">
                <SkipForward size={20} fill="currentColor" />
              </button>
              <button className="text-text-dim hover:text-text-main transition-colors">
                <Repeat size={16} />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-3 w-full text-[11px] text-text-dim">
              <span className="min-w-[32px] text-right text-[12px] font-medium opacity-80">
                <InteractiveText text={formatTime(currentTime)} mode="letter" />
              </span>
              
              <div 
                ref={progressRef}
                className="flex-1 h-6 flex flex-col justify-center cursor-pointer relative group"
                onPointerDown={handleProgressPointerDown}
                onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
                onPointerMove={(e) => {
                  if (e.buttons === 1) handleProgressDrag(e);
                }}
              >
                <div className="w-full h-[4px] group-hover:h-[6px] bg-glass-border rounded-full relative transition-all duration-300">
                  <div 
                    className="absolute left-0 h-full bg-text-main rounded-full top-0 transition-all duration-150 ease-out"
                    style={{ width: `${progress * 100}%` }}
                  >
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 shadow-xl transition-all duration-300" />
                  </div>
                </div>
              </div>

              <span className="min-w-[32px] text-[12px] font-medium opacity-80">
                <InteractiveText text={formatTime(currentTrack.duration)} mode="letter" />
              </span>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center justify-end gap-2 w-[300px]">
             <button 
              onClick={toggleLyrics}
              className={`text-[14px] cursor-pointer transition-colors hidden lg:block mr-2 px-3 py-1 rounded-full ${showLyrics ? 'bg-white text-black font-semibold' : 'text-text-main/60 hover:text-text-main hover:bg-white/10'}`}
            >
              <InteractiveText text="Lyrics" active={false} />
            </button>
            <button
              onClick={toggleQueue}
              className={`text-[14px] cursor-pointer transition-colors hidden lg:block mr-2 px-3 py-1 rounded-full ${showQueue ? 'bg-white text-black font-semibold' : 'text-text-main/60 hover:text-text-main hover:bg-white/10'}`}
            >
              <InteractiveText text="Queue" active={false} />
            </button>
            
            {/* EQ Profile Menu */}
            <div className="relative" ref={eqMenuRef}>
              <button 
                onClick={() => setShowEq(!showEq)}
                className={`p-2 rounded-full transition-all hover:bg-glass-border ${showEq ? 'bg-glass-border text-text-main' : 'text-text-dim'}`}
                title="EQ Profiles"
              >
                <SlidersHorizontal size={16} />
              </button>

              <AnimatePresence>
                {showEq && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full right-0 mb-4 w-48 bg-[#18181b] border border-glass-border rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden z-50 flex flex-col py-1"
                  >
                    <div className="px-4 py-2 text-xs font-semibold text-text-main/60 uppercase tracking-wider mb-1 border-b border-glass-border">
                      <InteractiveText text="Audio EQ" />
                    </div>
                    {Object.keys(EQ_PROFILES).map((profileName) => (
                      <button
                        key={profileName}
                        onClick={() => {
                          setEqProfile(profileName);
                          // Optional: Auto close or leave open. We'll leave it open for quick toggling
                        }}
                        className="flex items-center justify-between w-full px-4 py-2.5 text-sm text-left hover:bg-white/5 transition-colors group"
                      >
                        <span className="flex-1">
                          <InteractiveText text={profileName} active={eqProfile === profileName} />
                        </span>
                        {eqProfile === profileName && <Check size={16} className="text-accent" />}
                      </button>
                    ))}

                    <div className="px-4 py-2 text-xs font-semibold text-text-main/60 uppercase tracking-wider mt-2 mb-1 border-b border-glass-border">
                      <InteractiveText text="Dimensional Audio" />
                    </div>
                    {(['none', '4d', '6d', '8d', '10d', '12d', '16d', '20d'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setDimensionalMode(mode)}
                        className="flex items-center justify-between w-full px-4 py-2 text-sm text-left hover:bg-white/5 transition-colors group"
                      >
                        <span className="flex-1 uppercase font-bold text-[10px]">
                          <InteractiveText text={`${mode} Audio`} active={dimensionalMode === mode} />
                        </span>
                        {dimensionalMode === mode && <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(250,36,60,0.8)]" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center gap-2 w-28 group/volcontainer ml-1">
              <button onClick={toggleMute} className="text-text-dim hover:text-text-main transition-all hover:scale-110 active:scale-95 flex-shrink-0 relative w-6 h-6 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={volume === 0 ? 'mute' : volume < 0.5 ? 'low' : 'high'}
                    initial={{ opacity: 0, scale: 0.6, rotate: -30 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    exit={{ opacity: 0, scale: 0.6, rotate: 30 }}
                    transition={{ duration: 0.15 }}
                    className="absolute"
                  >
                    <VolumeIcon size={16} />
                  </motion.div>
                </AnimatePresence>
              </button>

              <div 
                ref={volumeRef}
                className="flex-1 h-6 flex flex-col justify-center cursor-pointer relative group/volume"
                onPointerDown={handleVolumePointerDown}
                onPointerUp={(e) => e.currentTarget.releasePointerCapture(e.pointerId)}
                onPointerMove={(e) => {
                  if (e.buttons === 1) handleVolumeDrag(e);
                }}
              >
                <div className="w-full h-[4px] group-hover/volume:h-[6px] bg-glass-border rounded-full relative transition-all duration-300">
                  <motion.div 
                    className="h-full bg-text-main rounded-full absolute left-0 top-0 overflow-visible"
                    animate={{ 
                      width: `${volume * 100}%`,
                      boxShadow: volume > 0 ? `0 0 ${10 + volume * 15}px rgba(255, 255, 255, ${0.1 + volume * 0.3})` : 'none'
                    }}
                    transition={{ 
                      type: 'spring', 
                      stiffness: 400, 
                      damping: 35,
                      mass: 0.8
                    }}
                  >
                    <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 scale-50 group-hover/volume:opacity-100 group-hover/volume:scale-100 shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  </div>
);
}
