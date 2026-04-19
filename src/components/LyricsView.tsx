import React, { useEffect, useRef, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from '../contexts/PlayerContext';
import { InteractiveText } from './InteractiveText';
import { MOCK_TRACKS } from '../data/mockData';
import { generateLyrics } from '../services/lyricsGenerator';
import { Loader2 } from 'lucide-react';

export function LyricsView() {
  const { currentTrack, progress, currentTime, showLyrics, seek } = usePlayer();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [aiLyrics, setAiLyrics] = useState<{ time: number, text: string }[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Removed internal currentTime calculation that relied on metadata duration scaling

  // Double-safe lyrics detection
  const lyrics = useMemo(() => {
    if (!currentTrack) return null;
    if (aiLyrics) return aiLyrics; // Prefer AI generated if it just finished
    if (currentTrack.lyrics) return currentTrack.lyrics;

    // Fallback: search mock data if not on object
    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/gi, '').trim();
    const target = normalize(currentTrack.title);
    const match = MOCK_TRACKS.find(m => normalize(m.title) === target || target.includes(normalize(m.title)) || normalize(m.title).includes(target));
    return match?.lyrics || null;
  }, [currentTrack, aiLyrics]);

  // Handle AI Lyric Generation
  useEffect(() => {
    if (showLyrics && currentTrack && !lyrics && !isGenerating) {
      const fetchAiLyrics = async () => {
        setIsGenerating(true);
        const result = await generateLyrics(currentTrack.title, currentTrack.artist, currentTrack.duration);
        if (result) {
          setAiLyrics(result);
        }
        setIsGenerating(false);
      };
      fetchAiLyrics();
    }
  }, [showLyrics, currentTrack, lyrics, isGenerating]);

  // Reset AI lyrics when track changes
  useEffect(() => {
    setAiLyrics(null);
  }, [currentTrack?.id]);

  // Auto-scroll logic
  useEffect(() => {
    if (!currentTrack || !lyrics || !scrollRef.current || !showLyrics) return;

    // Find the current active line index
    const activeIndex = lyrics.findIndex((lyric, index) => {
      const isLast = index === lyrics.length - 1;
      if (isLast) return currentTime >= lyric.time;
      return currentTime >= lyric.time && currentTime < lyrics[index + 1].time;
    });

    if (activeIndex !== -1) {
      const activeElement = scrollRef.current.children[activeIndex] as HTMLElement;
      if (activeElement) {
        // Smoothly scroll the container so the active element is centered
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentTime, currentTrack, lyrics, showLyrics]);

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {showLyrics && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-x-0 top-0 bottom-[100px] z-40 bg-[#0a0a0c]/95 overflow-hidden flex"
        >
          {/* Deeply blurred backdrop */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none mix-blend-screen mix-blend-color-dodge">
            <img 
              src={currentTrack.coverUrl} 
              alt="" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover filter blur-[100px] scale-150 transform-gpu"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-[#0a0a0c]"></div>
          </div>

          <div className="relative z-10 w-full h-full flex px-10 py-10 max-w-[1400px] mx-auto gap-12 lg:gap-24 items-center">
            
            {/* Left side: Artwork & Info */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="hidden md:flex flex-col gap-6 w-[400px] shrink-0"
            >
              <div className="w-[300px] h-[300px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <img src={currentTrack.coverUrl} referrerPolicy="no-referrer" className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
                  <InteractiveText text={currentTrack.title} mode="word" />
                </h1>
                <p className="text-xl text-text-dim">
                  <InteractiveText text={currentTrack.artist} />
                </p>
                {isGenerating && (
                  <div className="flex items-center gap-2 mt-4 text-accent animate-pulse">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-sm font-semibold uppercase tracking-widest"><InteractiveText text="AI Synthesizing Ingredients..." mode="letter" /></span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Right side: Lyrics Scroller */}
            <div className="flex-1 h-full relative no-scrollbar mask-image-fade" style={{ WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)' }}>
              <div ref={scrollRef} className="h-full overflow-y-auto no-scrollbar py-[40vh] pb-[60vh] scroll-smooth pr-10">
                {lyrics ? (
                  lyrics.map((lyric, index) => {
                    const isLast = index === lyrics.length - 1;
                    const isActive = isLast 
                      ? currentTime >= lyric.time 
                      : (currentTime >= lyric.time && currentTime < lyrics[index + 1].time);
                    
                    const isPassed = currentTime > lyric.time && !isActive;

                    return (
                      <motion.p
                        key={index}
                        initial={false}
                        animate={{
                          opacity: isActive ? 1 : (isPassed ? 0.3 : 0.4),
                          scale: isActive ? 1 : 0.95,
                          color: isActive ? '#ffffff' : '#a1a1aa'
                        }}
                        transition={{ duration: 0.4 }}
                        className={`text-3xl md:text-5xl font-bold leading-[1.4] md:leading-[1.4] mb-8 cursor-pointer hover:opacity-100 transition-opacity origin-left ${isActive ? 'text-glow drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]' : ''}`}
                        onClick={() => {
                           if (currentTrack.duration > 0) {
                             seek(lyric.time / currentTrack.duration);
                           }
                        }}
                      >
                        <InteractiveText text={lyric.text} mode="word" active={false} />
                      </motion.p>
                    );
                  })
                ) : isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center space-y-8">
                     <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                     <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                     <div className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"></div>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center px-6"
                  >
                    <motion.div
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.05, 0.95, 1]
                      }}
                      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                      className="mb-8 opacity-20"
                    >
                      <img src={currentTrack.coverUrl} referrerPolicy="no-referrer" className="w-64 h-64 rounded-full blur-2xl" alt="" />
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white/90">
                      <InteractiveText text="Words are missing," mode="word" />
                    </h2>
                    <p className="text-xl md:text-2xl font-medium text-text-dim/80 max-w-md leading-relaxed">
                      <InteractiveText text="But the melody speaks for itself. We're still searching for these lyrics." />
                    </p>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100px" }}
                      className="h-1 bg-white/20 mt-12 rounded-full overflow-hidden"
                    >
                      <motion.div 
                        animate={{ x: [-100, 100] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-full h-full bg-accent"
                      />
                    </motion.div>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
