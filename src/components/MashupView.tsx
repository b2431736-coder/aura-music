import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Play, Pause, Zap, Wand2, X, Music2, Layers } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { InteractiveText } from './InteractiveText';
import { fetchTopTracks } from '../services/musicApi';
import { Track } from '../data/mockData';
import { analyzeMashup, MashupInstructions } from '../services/mashupService';

export function MashupView({ onClose }: { onClose: () => void }) {
  const { isPlaying: mainIsPlaying, togglePlayPause: toggleMain } = usePlayer();
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [trackA, setTrackA] = useState<Track | null>(null);
  const [trackB, setTrackB] = useState<Track | null>(null);
  const [instructions, setInstructions] = useState<MashupInstructions | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isMashupPlaying, setIsMashupPlaying] = useState(false);
  const [nudgeOffset, setNudgeOffset] = useState(0); // in ms
  const [activeBpm, setActiveBpm] = useState(0);
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(false);
  const [dimensionalMode, setDimensionalMode] = useState<'none' | '4d' | '6d' | '8d' | '10d' | '12d' | '16d' | '20d'>('none');
  const [eqProfile, setEqProfile] = useState<'normal' | 'bass' | 'vocal' | 'bright'>('normal');
  
  const audioARef = useRef<HTMLAudioElement>(null);
  const audioBRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  const pannerARef = useRef<StereoPannerNode | null>(null);
  const pannerBRef = useRef<StereoPannerNode | null>(null);
  
  const filterARef = useRef<BiquadFilterNode[]>([]);
  const filterBRef = useRef<BiquadFilterNode[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Initialize Web Audio API
  useEffect(() => {
    if (isMashupPlaying && !audioCtxRef.current) {
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const sourceA = ctx.createMediaElementSource(audioARef.current!);
      const sourceB = ctx.createMediaElementSource(audioBRef.current!);
      
      const pannerA = ctx.createStereoPanner();
      const pannerB = ctx.createStereoPanner();
      
      // Create EQ filters for both tracks
      const createFilters = () => {
        const low = ctx.createBiquadFilter(); low.type = 'lowshelf'; low.frequency.value = 200;
        const mid = ctx.createBiquadFilter(); mid.type = 'peaking'; mid.frequency.value = 1000; mid.Q.value = 1;
        const high = ctx.createBiquadFilter(); high.type = 'highshelf'; high.frequency.value = 5000;
        return [low, mid, high];
      };

      const filtersA = createFilters();
      const filtersB = createFilters();
      
      filterARef.current = filtersA;
      filterBRef.current = filtersB;

      // Connect Track A chain: source -> filters -> panner -> destination
      sourceA.connect(filtersA[0]).connect(filtersA[1]).connect(filtersA[2]).connect(pannerA).connect(ctx.destination);
      
      // Connect Track B chain: source -> filters -> panner -> destination
      sourceB.connect(filtersB[0]).connect(filtersB[1]).connect(filtersB[2]).connect(pannerB).connect(ctx.destination);
      
      pannerARef.current = pannerA;
      pannerBRef.current = pannerB;
    }
    
    if (isMashupPlaying && audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  }, [isMashupPlaying]);

  // Handle EQ Profile Updates
  useEffect(() => {
    const applyEq = (filters: BiquadFilterNode[]) => {
      if (!filters.length) return;
      const [low, mid, high] = filters;
      
      switch (eqProfile) {
        case 'bass':
          low.gain.value = 8; mid.gain.value = -2; high.gain.value = -2;
          break;
        case 'vocal':
          low.gain.value = -4; mid.gain.value = 6; high.gain.value = 2;
          break;
        case 'bright':
          low.gain.value = -2; mid.gain.value = 0; high.gain.value = 8;
          break;
        default:
          low.gain.value = 0; mid.gain.value = 0; high.gain.value = 0;
      }
    };

    applyEq(filterARef.current);
    applyEq(filterBRef.current);
  }, [eqProfile, isMashupPlaying]);

  // Handle Dimensional Audio Animation
  useEffect(() => {
    let frameId: number;
    const start = Date.now();
    
    const animate = () => {
      if (!isMashupPlaying || dimensionalMode === 'none' || !pannerARef.current || !pannerBRef.current) {
        if (pannerARef.current) pannerARef.current.pan.value = 0;
        if (pannerBRef.current) pannerBRef.current.pan.value = 0;
        return;
      }

      const elapsed = (Date.now() - start) / 1000;
      let speed = 1;
      if (dimensionalMode === '4d') speed = 0.3;
      else if (dimensionalMode === '6d') speed = 0.6;
      else if (dimensionalMode === '8d') speed = 1.2;
      else if (dimensionalMode === '10d') speed = 1.8;
      else if (dimensionalMode === '12d') speed = 2.5;
      else if (dimensionalMode === '16d') speed = 3.8;
      else if (dimensionalMode === '20d') speed = 5.5;

      const panValue = Math.sin(elapsed * speed);
      pannerARef.current.pan.value = panValue;
      pannerBRef.current.pan.value = -panValue; // Inverse for wider stage

      frameId = requestAnimationFrame(animate);
    };

    if (isMashupPlaying && dimensionalMode !== 'none') {
      frameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(frameId);
  }, [isMashupPlaying, dimensionalMode]);

  // Focus search when opened
  useEffect(() => {
    if (!isSearchCollapsed) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchCollapsed]);

  // Sync state and pulsing
  useEffect(() => {
    let interval: any;
    if (isMashupPlaying && instructions) {
      const targetBpm = instructions.bpmA * instructions.playbackRateA;
      setActiveBpm(targetBpm);
    } else {
      setActiveBpm(0);
    }
    return () => clearInterval(interval);
  }, [isMashupPlaying, instructions]);

  // Pause main player if mashup starts
  useEffect(() => {
    if (isMashupPlaying && mainIsPlaying) {
      toggleMain();
    }
  }, [isMashupPlaying, mainIsPlaying, toggleMain]);

  // Auto collapse search when both tracks selected
  useEffect(() => {
    if (trackA && trackB && !instructions) {
      setIsSearchCollapsed(true);
    }
  }, [trackA, trackB, instructions]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search) return;
    const results = await fetchTopTracks(search);
    setSearchResults(results);
  };

  const handleSynthesize = async () => {
    if (!trackA || !trackB) return;
    setIsSynthesizing(true);
    const result = await analyzeMashup(trackA, trackB);
    if (result) {
      setInstructions(result);
    }
    setIsSynthesizing(false);
  };

  const toggleMashup = () => {
    if (!audioARef.current || !audioBRef.current || !instructions) return;

    if (isMashupPlaying) {
      audioARef.current.pause();
      audioBRef.current.pause();
      setIsMashupPlaying(false);
    } else {
      // Apply AI Sync with High-Fidelity settings
      audioARef.current.preservesPitch = true;
      audioBRef.current.preservesPitch = true;
      
      audioARef.current.playbackRate = instructions.playbackRateA;
      audioBRef.current.playbackRate = instructions.playbackRateB;
      
      // Start with AI Offsets
      audioARef.current.currentTime = instructions.energyStartA;
      audioBRef.current.currentTime = instructions.energyStartB + (nudgeOffset / 1000);
      
      audioARef.current.play();
      audioBRef.current.play();
      setIsMashupPlaying(true);
    }
  };

  const handleNudge = (val: number) => {
    setNudgeOffset(prev => prev + val);
    if (isMashupPlaying && audioBRef.current && instructions) {
      audioBRef.current.currentTime = instructions.energyStartB + (nudgeOffset + val) / 1000;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-2xl flex flex-col p-8 overflow-hidden"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-accent rounded-xl text-white shadow-[0_0_20px_rgba(255,51,102,0.4)]">
            <Layers size={32} />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">
              <InteractiveText text="AI MASHUP STUDIO" mode="word" />
            </h1>
            <p className="text-text-dim font-medium uppercase tracking-widest text-xs">
              <InteractiveText text="Powered by Gemini Synthesis" />
            </p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex overflow-hidden">
        
        {/* Cinematic Workspace */}
        <div className={`flex-1 flex flex-col gap-12 items-center justify-start py-12 lg:justify-center relative transition-all duration-1000 ease-[0.23, 1, 0.32, 1] overflow-y-auto no-scrollbar ${!isSearchCollapsed ? 'lg:pl-[400px]' : 'pl-0'}`}>
          
          <div className="flex flex-col md:flex-row items-center gap-8 lg:gap-24 relative scale-95 lg:scale-110">
            {/* Track A Card */}
            <TrackCard 
              track={trackA} 
              slot="A" 
              color="border-accent" 
              onClick={() => setIsSearchCollapsed(false)} 
            />
            
            {/* The Orb */}
            <div className="relative group">
               <motion.div 
                  animate={{ 
                    scale: isSynthesizing ? [1, 1.2, 0.9, 1.1, 1] : (isMashupPlaying ? [1, 1.1, 1] : 1),
                    rotate: isMashupPlaying ? 360 : 0
                  }}
                  transition={{ 
                    duration: isSynthesizing ? 0.5 : (isMashupPlaying ? 8 : 2), 
                    repeat: Infinity, 
                    ease: "linear" 
                  }}
                  className={`w-56 h-56 lg:w-72 lg:h-72 rounded-full flex items-center justify-center p-1 relative
                    ${isSynthesizing ? 'bg-gradient-to-tr from-accent via-white to-indigo-500 animate-spin-fast' : 'bg-white/5 border-2 border-dashed border-white/20'}`}
               >
                  <div className="absolute inset-0 rounded-full blur-3xl opacity-50 bg-gradient-to-tr from-accent to-indigo-500 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="w-full h-full rounded-full bg-black flex flex-col items-center justify-center text-center p-6 z-10">
                    {!trackA || !trackB ? (
                      <>
                        <Layers className="text-white/20 mb-2" size={56} />
                        <p className="text-[12px] text-white/40 uppercase tracking-[4px] font-bold">Bridge Tracks</p>
                      </>
                    ) : isSynthesizing ? (
                      <div className="space-y-4">
                        <Wand2 className="text-white animate-pulse mx-auto" size={56} />
                        <p className="text-[12px] text-white uppercase tracking-[6px] font-black animate-pulse">Synthesizing</p>
                      </div>
                    ) : instructions ? (
                      <button 
                        onClick={toggleMashup}
                        className="w-full h-full flex flex-col items-center justify-center group/play"
                      >
                        {isMashupPlaying ? <Pause size={80} className="text-white fill-white" /> : <Play size={80} className="text-accent fill-accent group-hover/play:scale-110 transition-transform ml-2" />}
                        <p className="mt-4 text-[12px] text-white/60 uppercase tracking-[6px] font-black">
                          {isMashupPlaying ? 'Live Sync' : 'Start Synthesis'}
                        </p>
                      </button>
                    ) : (
                      <button 
                        onClick={handleSynthesize}
                        className="flex flex-col items-center hover:scale-110 transition-transform"
                      >
                        <Zap size={80} className="text-yellow-400 fill-yellow-400 mb-2" />
                        <p className="text-[12px] text-white uppercase tracking-[6px] font-black">Analyze</p>
                      </button>
                    )}
                  </div>
               </motion.div>
            </div>

            {/* Track B Card */}
            <TrackCard 
              track={trackB} 
              slot="B" 
              color="border-indigo-500" 
              onClick={() => setIsSearchCollapsed(false)} 
            />
            
            {/* Visual Connections */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[1px] bg-gradient-to-r from-accent via-transparent to-indigo-500 opacity-20 -z-10" />
          </div>

          {/* Synthesis Report & Mastering Console */}
          <div className="w-full flex flex-col items-center">
            {instructions ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-4xl w-full bg-white/[0.03] border border-white/10 rounded-[40px] p-10 backdrop-blur-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
              >
                <div className="flex flex-col gap-8">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center shrink-0 border border-accent/30 text-accent">
                      <Stars size={32} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-white mb-1 tracking-tight">Gemini Synthesis Intelligence</h3>
                      <p className="text-text-dim leading-relaxed italic text-lg opacity-80">"{instructions.mashupReason}"</p>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center justify-between p-6 bg-white/[0.02] rounded-3xl border border-white/5 gap-8">
                    <div className="flex flex-col w-full lg:w-auto">
                      <span className="text-[11px] uppercase tracking-[3px] text-text-dim mb-3 font-bold">Manual Sync Nudge</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleNudge(-100)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95">-100ms</button>
                        <div className="min-w-[100px] text-center">
                          <span className={`text-2xl font-mono font-black ${nudgeOffset === 0 ? 'text-white/40' : nudgeOffset > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {nudgeOffset > 0 ? '+' : ''}{nudgeOffset}
                          </span>
                          <span className="text-[10px] block opacity-40 font-bold uppercase mt-1">millisec</span>
                        </div>
                        <button onClick={() => handleNudge(100)} className="px-5 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95">+100ms</button>
                        <button onClick={() => setNudgeOffset(0)} className="ml-4 w-10 h-10 flex items-center justify-center bg-accent/20 hover:bg-accent/40 rounded-full text-accent transition-all hover:rotate-90" title="Reset Sync">
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="hidden lg:block h-16 w-[1px] bg-white/10" />

                    <div className="flex flex-col gap-6 w-full lg:w-auto">
                      <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex flex-col">
                          <span className="text-[11px] uppercase tracking-[3px] text-text-dim mb-3 font-bold">EQ Profile</span>
                          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                            {(['normal', 'bass', 'vocal', 'bright'] as const).map((profile) => (
                              <button
                                key={profile}
                                onClick={() => setEqProfile(profile)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${eqProfile === profile ? 'bg-indigo-500 text-white shadow-lg' : 'text-text-dim hover:text-white'}`}
                              >
                                {profile}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[11px] uppercase tracking-[3px] text-text-dim mb-3 font-bold">Dimensional Audio</span>
                          <div className="flex flex-wrap bg-white/5 p-1 rounded-2xl border border-white/5 gap-1">
                            {(['none', '4d', '6d', '8d', '10d', '12d', '16d', '20d'] as const).map((mode) => (
                              <button
                                key={mode}
                                onClick={() => setDimensionalMode(mode)}
                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${dimensionalMode === mode ? 'bg-accent text-white shadow-lg' : 'text-text-dim hover:text-white'}`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden lg:block h-16 w-[1px] bg-white/10" />
                    
                    <div className="flex flex-col items-center lg:items-end w-full lg:w-auto">
                      <span className="text-[11px] uppercase tracking-[3px] text-text-dim mb-3 font-bold">Output Tempo</span>
                      <div className="flex items-center gap-4">
                         <div className={`w-4 h-4 rounded-full bg-accent ${isMashupPlaying ? 'animate-ping' : 'opacity-20'}`} />
                         <span className="text-4xl font-black text-white tracking-tighter">{activeBpm ? Math.round(activeBpm) : '--'} <span className="text-sm font-medium opacity-40 ml-1">BPM</span></span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                     <Stat 
                        label={`Track A: ${instructions.sectionLabelA}`} 
                        value={`Start @ ${instructions.energyStartA.toFixed(1)}s`} 
                        highlight="green"
                     />
                     <Stat 
                        label={`Track B: ${instructions.sectionLabelB}`} 
                        value={`Start @ ${instructions.energyStartB.toFixed(1)}s`} 
                        highlight="green"
                     />
                     <Stat 
                        label="Master Pitch" 
                        value="Preserved" 
                        highlight="green" 
                     />
                     <Stat 
                        label="Playback Rate" 
                        value="1.0x (HQ)" 
                        highlight="green" 
                     />
                  </div>
                  
                  {/* Quality Info */}
                  <div className="flex items-center gap-3 mt-4 py-2 px-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                    <Stars size={16} className="text-green-400" />
                    <p className="text-[10px] font-bold text-green-200 uppercase tracking-widest text-center w-full">
                      Zero-Stretch Mode Active: Track speeds are preserved at 1.0x for maximum audio fidelity.
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="max-w-4xl w-full bg-white/[0.01] border border-white/5 border-dashed rounded-[40px] p-12 text-center opacity-40">
                <p className="text-sm font-bold uppercase tracking-[4px] text-white/50">Mastering Console & AI Insights will appear after Bridge Analysis</p>
                <div className="flex justify-center gap-8 mt-8 grayscale pointer-events-none">
                  <div className="h-10 w-32 bg-white/5 rounded-xl" />
                  <div className="h-10 w-32 bg-white/5 rounded-xl" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Floating Sidebar: Input Selection */}
        <AnimatePresence>
          {!isSearchCollapsed ? (
            <motion.div 
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute left-0 top-0 bottom-0 w-[380px] bg-black/40 backdrop-blur-3xl border-r border-white/10 p-8 flex flex-col gap-8 z-20 shadow-[20px_0_50px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-white tracking-tight">SOURCE SELECTION</h2>
                <button 
                  onClick={() => setIsSearchCollapsed(true)}
                  className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" size={18} />
                <input 
                  ref={searchInputRef}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Identify your tracks..."
                  className="w-full h-12 pl-12 pr-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-accent transition-colors"
                />
              </form>

              <div className="flex-1 overflow-y-auto pr-4 no-scrollbar space-y-4">
                {searchResults.length === 0 && !search && (
                   <div className="h-full flex flex-col items-center justify-center text-center opacity-30 text-white p-8">
                     <Search size={48} className="mb-4" />
                     <p className="text-sm font-bold">Search for any song components to synthesize</p>
                   </div>
                )}
                {searchResults.map(track => (
                  <motion.div 
                    key={track.id}
                    layoutId={`track-${track.id}`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                      <img src={track.coverUrl} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-white truncate">{track.title}</p>
                      <p className="text-xs text-text-dim truncate">{track.artist}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setTrackA(track); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${trackA?.id === track.id ? 'bg-accent text-white' : 'bg-white/10 text-text-dim hover:bg-white/20'}`}
                      >
                        Slot A
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setTrackB(track); }}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${trackB?.id === track.id ? 'bg-indigo-500 text-white' : 'bg-white/10 text-text-dim hover:bg-white/20'}`}
                      >
                        Slot B
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              className="absolute left-8 top-1/2 -translate-y-1/2 z-20"
            >
              <button 
                onClick={() => setIsSearchCollapsed(false)}
                className="rotate-90 origin-left py-4 px-8 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center gap-3 text-white transition-all group shadow-2xl backdrop-blur-xl"
              >
                <Search size={18} className="text-accent" />
                <span className="text-sm font-black uppercase tracking-[3px] group-hover:tracking-[6px] transition-all">Selection Console</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hidden Audio Elements */}
      {trackA && <audio ref={audioARef} src={trackA.previewUrl} crossOrigin="anonymous" />}
      {trackB && <audio ref={audioBRef} src={trackB.previewUrl} crossOrigin="anonymous" />}
    </motion.div>
  );
}

function TrackCard({ track, slot, color, onClick }: { track: Track | null, slot: string, color: string, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className={`w-[140px] md:w-[180px] h-[220px] md:h-[260px] rounded-2xl bg-white/5 border ${track ? color : 'border-white/10 border-dashed'} flex flex-col p-4 relative overflow-hidden group cursor-pointer hover:bg-white/10 transition-all`}
    >
      <div className="absolute top-4 right-4 text-[10px] font-black uppercase text-white/20 tracking-widest">Slot {slot}</div>
      {track ? (
        <>
          <div className="w-full aspect-square rounded-xl overflow-hidden mb-4 shadow-2xl">
            <img src={track.coverUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
          </div>
          <p className="text-sm font-bold text-white leading-tight mb-1 truncate">{track.title}</p>
          <p className="text-xs text-text-dim mb-4 truncate">{track.artist}</p>
          <div className="mt-auto flex justify-between items-end opacity-40">
             <div className="flex gap-1 h-3 items-end">
               {[1,2,3,4,1,2].map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: ['20%', '100%', '30%', '80%', '40%'] }}
                    transition={{ duration: 0.5 + Math.random(), repeat: Infinity, ease: 'easeInOut' }}
                    className="w-[2px] bg-white rounded-full"
                  />
               ))}
             </div>
             <p className="text-[10px] font-mono">BPM: ?</p>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-20">
          <Music2 size={48} className="mb-4" />
          <p className="text-xs uppercase font-bold tracking-widest">Awaiting Audio</p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string, value: string, highlight?: 'green' | 'yellow' | 'red' }) {
  const colorClass = highlight === 'green' ? 'text-green-400' : highlight === 'red' ? 'text-red-400' : highlight === 'yellow' ? 'text-yellow-400' : 'text-white';
  
  return (
    <div className={`p-4 rounded-2xl bg-white/5 border ${highlight ? `border-${highlight}-500/20` : 'border-white/5'} transition-colors`}>
      <p className="text-[10px] uppercase tracking-widest font-black text-text-dim mb-2">{label}</p>
      <p className={`text-xl font-bold font-mono ${colorClass}`}>{value}</p>
    </div>
  );
}

function Stars({ size, className }: { size: number, className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <Zap size={size} />
      <div className="absolute -top-1 -right-2 animate-pulse">✨</div>
    </div>
  );
}
