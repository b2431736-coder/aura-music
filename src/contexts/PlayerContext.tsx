import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Track, MOCK_TRACKS } from '../data/mockData';

export const EQ_PROFILES: Record<string, number[]> = {
  'Flat': [0, 0, 0, 0, 0],
  'Acoustic': [3, 0, 2, 1, 4],
  'Bass Boost': [6, 3, -1, -2, -2],
  'Electronic': [4, 1, -2, 2, 4],
  'Pop': [-1, 1, 4, 2, -1],
  'Rock': [4, 2, -3, 3, 4],
  'Treble Boost': [-2, -2, 0, 4, 6],
  'Surround Sound': [4, 1, -1, 2, 3]
};

export type EQProfileName = keyof typeof EQ_PROFILES;

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number; // 0 to 1
  currentTime: number; // in seconds
  volume: number; // 0 to 1
  eqProfile: string;
  dimensionalMode: 'none' | '4d' | '6d' | '8d' | '10d' | '12d' | '16d' | '20d';
  showLyrics: boolean;
  showQueue: boolean;
  playTrack: (track: Track) => void;
  togglePlayPause: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
  setEqProfile: (profile: string) => void;
  setDimensionalMode: (mode: 'none' | '4d' | '6d' | '8d' | '10d' | '12d' | '16d' | '20d') => void;
  toggleLyrics: () => void;
  toggleQueue: () => void;
  playlist: Track[];
  setPlaylist: (tracks: Track[]) => void;
  removeFromQueue: (trackId: string) => void;
  addToQueue: (track: Track) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  recentlyPlayed: Track[];
  notification: string | null;
  notify: (message: string) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const [playlist, setPlaylist] = useState<Track[]>(MOCK_TRACKS);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(MOCK_TRACKS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [eqProfile, setEqProfile] = useState<string>('Flat');
  const [dimensionalMode, setDimensionalMode] = useState<'none' | '4d' | '6d' | '8d' | '10d' | '12d' | '16d' | '20d'>('none');
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('Home');
  const [recentlyPlayed, setRecentlyPlayed] = useState<Track[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const spatialGainsRef = useRef<{ wet: GainNode, dry: GainNode } | null>(null);
  const pannerRef = useRef<StereoPannerNode | null>(null);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.crossOrigin = "anonymous"; // Required for Web Audio API EQ
    audioRef.current = audio;
    audioRef.current.volume = volume;
    
    try {
      const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextCtor) {
        const ctx = new AudioContextCtor();
        audioCtxRef.current = ctx;

        const source = ctx.createMediaElementSource(audio);
        
        // Pre-amp to create headroom and prevent digital clipping when boosting EQ
        const preAmp = ctx.createGain();
        preAmp.gain.value = 0.7; // -3dB headroom for EQ
        
        // 5 Band EQ
        const bands = [60, 230, 910, 3600, 14000];
        const filters: BiquadFilterNode[] = bands.map(freq => {
          const filter = ctx.createBiquadFilter();
          filter.type = freq < 100 ? 'lowshelf' : freq > 10000 ? 'highshelf' : 'peaking';
          filter.frequency.value = freq;
          filter.Q.value = 1;
          filter.gain.value = 0;
          return filter;
        });

        filtersRef.current = filters;

        source.connect(preAmp);
        preAmp.connect(filters[0]);
        for(let i = 0; i < filters.length - 1; i++) {
          filters[i].connect(filters[i+1]);
        }
        
        // Surround Sound Spatializer Engine
        const dryGain = ctx.createGain();
        const wetGain = ctx.createGain();
        dryGain.gain.value = 1;
        wetGain.gain.value = 0;

        const surroundDelay = ctx.createDelay();
        surroundDelay.delayTime.value = 0.035; // 35ms reflection
        
        const surroundFeedback = ctx.createGain();
        surroundFeedback.gain.value = 0.3; // room tail length
        surroundDelay.connect(surroundFeedback);
        surroundFeedback.connect(surroundDelay);
        
        const surroundFilter = ctx.createBiquadFilter();
        surroundFilter.type = 'lowpass';
        surroundFilter.frequency.value = 3500; // dampen the echo highs

        const lastFilter = filters[filters.length - 1];
        lastFilter.connect(dryGain);
        lastFilter.connect(surroundDelay);
        
        surroundDelay.connect(surroundFilter);
        surroundFilter.connect(wetGain);
        
        // Master Compressor acting as a Brickwall Limiter to obliterate remaining clipping
        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.value = -3;
        compressor.knee.value = 0; // Hard knee
        compressor.ratio.value = 20; // 20:1 ratio acts flat like a limiter
        compressor.attack.value = 0.002;
        compressor.release.value = 0.1;

        dryGain.connect(compressor);
        wetGain.connect(compressor);

        // Dimensional Audio Panner
        const panner = ctx.createStereoPanner();
        compressor.connect(panner);
        panner.connect(ctx.destination);

        spatialGainsRef.current = { wet: wetGain, dry: dryGain };
        pannerRef.current = panner;
      }
    } catch (err) {
      console.error("Web Audio API failed to initialize:", err);
    }

    let animationFrameId: number;
    const updateProgress = () => {
      if (audioRef.current && audioRef.current.duration) {
        setCurrentTime(audioRef.current.currentTime);
        setProgress(audioRef.current.currentTime / audioRef.current.duration);
      }
      animationFrameId = requestAnimationFrame(updateProgress);
    };

    const handlePlay = () => {
      updateProgress();
    };

    const handlePause = () => {
      cancelAnimationFrame(animationFrameId);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameId);
      nextTrackRef.current();
    };
    
    const handleError = (e: Event) => {
      console.error("Audio element error:", audioRef.current?.error);
      setIsPlaying(false);
      cancelAnimationFrame(animationFrameId);
    };

    audioRef.current.addEventListener('ended', handleEnded);
    audioRef.current.addEventListener('error', handleError);
    audioRef.current.addEventListener('play', handlePlay);
    audioRef.current.addEventListener('pause', handlePause);

    if (!audioRef.current.paused) {
      updateProgress();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener('ended', handleEnded);
        audioRef.current.removeEventListener('error', handleError);
        audioRef.current.removeEventListener('play', handlePlay);
        audioRef.current.removeEventListener('pause', handlePause);
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const nextTrackRef = useRef(() => {});

  useEffect(() => {
    nextTrackRef.current = nextTrack;
  }, [playlist, currentTrack]);

  // Handle Recently Played
  useEffect(() => {
    if (currentTrack) {
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(t => t.id !== currentTrack.id);
        return [currentTrack, ...filtered].slice(0, 10); // Keep last 10 for display
      });
    }
  }, [currentTrack]);

  // Sync volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Update EQ filters and Spatializer
  useEffect(() => {
    if (!filtersRef.current || filtersRef.current.length === 0) return;
    const gains = EQ_PROFILES[eqProfile] || EQ_PROFILES['Flat'];
    
    filtersRef.current.forEach((filter, index) => {
       // Smoothly transition EQ changes so there's no popping
       if (audioCtxRef.current) {
         filter.gain.setTargetAtTime(gains[index], audioCtxRef.current.currentTime, 0.1);
       } else {
         filter.gain.value = gains[index];
       }
    });

    // Trigger Surround Sound Wet/Dry engines (properly balanced)
    if (spatialGainsRef.current && audioCtxRef.current) {
      if (eqProfile === 'Surround Sound') {
        spatialGainsRef.current.wet.gain.setTargetAtTime(0.4, audioCtxRef.current.currentTime, 0.2);
        spatialGainsRef.current.dry.gain.setTargetAtTime(0.7, audioCtxRef.current.currentTime, 0.2);
      } else {
        spatialGainsRef.current.wet.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.2);
        spatialGainsRef.current.dry.gain.setTargetAtTime(1, audioCtxRef.current.currentTime, 0.2);
      }
    }
  }, [eqProfile]);

  // Handle Dimensional Audio Animation for Main Player
  useEffect(() => {
    let frameId: number;
    const start = Date.now();
    
    const animate = () => {
      if (!isPlaying || dimensionalMode === 'none' || !pannerRef.current) {
        if (pannerRef.current) pannerRef.current.pan.setTargetAtTime(0, audioCtxRef.current?.currentTime || 0, 0.1);
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
      if (audioCtxRef.current) {
        // Use setTargetAtTime for glitch-free panning
        pannerRef.current.pan.setTargetAtTime(panValue, audioCtxRef.current.currentTime, 0.05);
      } else {
        pannerRef.current.pan.value = panValue;
      }

      frameId = requestAnimationFrame(animate);
    };

    if (isPlaying && dimensionalMode !== 'none') {
      frameId = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, dimensionalMode]);

  const ensureAudioContext = () => {
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTrack = (track: Track) => {
    ensureAudioContext();
    if (audioRef.current && track.previewUrl) {
      if (audioRef.current.getAttribute('src') !== track.previewUrl) {
        audioRef.current.setAttribute('src', track.previewUrl);
        audioRef.current.load();
        setProgress(0);
      }
      
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.error("Playback play failed:", e);
          if (e.name !== 'AbortError') {
            setIsPlaying(false);
          }
        });
      }
    }
    setCurrentTrack(track);
    setIsPlaying(true);
  };

  const togglePlayPause = () => {
    ensureAudioContext();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            console.error("Playback toggle failed:", e);
            setIsPlaying(false);
          });
        }
      }
    }
    setIsPlaying(!isPlaying);
  };

  const nextTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const nextIdx = (idx + 1) % playlist.length;
    playTrack(playlist[nextIdx]);
  };

  const prevTrack = () => {
    if (!currentTrack || playlist.length === 0) return;
    const idx = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIdx = idx <= 0 ? playlist.length - 1 : idx - 1;
    playTrack(playlist[prevIdx]);
  };

  const removeFromQueue = (trackId: string) => {
    setPlaylist(prev => prev.filter(t => t.id !== trackId));
  };

  const addToQueue = (track: Track) => {
    setPlaylist(prev => {
      if (prev.find(t => t.id === track.id)) return prev;
      return [...prev, track];
    });
  };

  const reorderQueue = (startIndex: number, endIndex: number) => {
    setPlaylist(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const seek = (value: number) => {
    setProgress(value);
    if (audioRef.current && audioRef.current.duration) {
      audioRef.current.currentTime = value * audioRef.current.duration;
    }
  };

  const toggleLyrics = () => {
    setShowLyrics(!showLyrics);
    if (showQueue) setShowQueue(false);
  };

  const toggleQueue = () => {
    setShowQueue(!showQueue);
    if (showLyrics) setShowLyrics(false);
  };

  const notify = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        volume,
        eqProfile,
        dimensionalMode,
        showLyrics,
        showQueue,
        playTrack,
        togglePlayPause,
        nextTrack,
        prevTrack,
        seek,
        setVolume,
        setEqProfile,
        setDimensionalMode,
        toggleLyrics,
        toggleQueue,
        playlist,
        setPlaylist,
        removeFromQueue,
        addToQueue,
        reorderQueue,
        currentTime,
        recentlyPlayed,
        notification,
        notify,
        currentView,
        setCurrentView
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
