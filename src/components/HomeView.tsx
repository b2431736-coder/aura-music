import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { usePlayer } from '../contexts/PlayerContext';
import { Search, Bell, X, Play, ChevronRight, Loader2, ListPlus } from 'lucide-react';
import { fetchTopTracks, fetchAlbums } from '../services/musicApi';
import { Track, MOCK_ALBUMS, MOCK_TRACKS } from '../data/mockData';
import { InteractiveText } from './InteractiveText';

interface AlbumCardProps {
  album: any;
  index: number;
  onPlay: (album: any) => void;
  key?: React.Key;
}

function AlbumCard({ album, index, onPlay }: AlbumCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);
  
  const imgX = useTransform(mouseXSpring, [-0.5, 0.5], ["-5%", "5%"]);
  const imgY = useTransform(mouseYSpring, [-0.5, 0.5], ["-5%", "5%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      key={album.id} 
      className="group relative flex flex-col cursor-pointer perspective-1000"
    >
      <div 
        onClick={() => onPlay(album)}
        className="relative w-full aspect-square rounded-[32px] mb-4 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.2)] group-hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)] transition-all duration-700 ease-[0.23, 1, 0.32, 1] group-hover:scale-[1.02]"
      >
        {/* Gloss & Depth Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-10 pointer-events-none"></div>
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"></div>
        
        {/* Parallax Image Content */}
        <motion.div 
          style={{ x: imgX, y: imgY, scale: 1.2 }}
          className="w-full h-full absolute inset-0"
        >
          <img 
            src={album.coverUrl} 
            alt={album.title} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover" 
          />
        </motion.div>
        
        {/* Play Button Overlay - Smooth Fade and Float */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.1 }}
            animate={{ 
              opacity: "var(--hover-op, 0)",
              scale: "var(--hover-sc, 0.8)",
              y: "var(--hover-y, 20)"
            }}
            style={{
              "--hover-op": "var(--is-hover, 0)",
              "--hover-sc": "calc(0.8 + 0.2 * var(--is-hover, 0))",
              "--hover-y": "calc(20px - 20px * var(--is-hover, 0))"
            } as any}
            className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-2xl border border-white/40 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all duration-700 ease-[0.23, 1, 0.32, 1] [--is-hover:0] group-hover:[--is-hover:1]"
          >
            <Play size={28} fill="white" className="text-white ml-1 filter drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]" />
          </motion.div>
        </div>
      </div>

      <div className="px-1 text-center lg:text-left">
        <h3 className="text-[16px] font-bold text-white truncate mb-1 leading-snug tracking-tight transition-colors group-hover:text-accent">
          <InteractiveText text={album.title} mode="word" />
        </h3>
        <p className="text-[14px] text-text-dim truncate font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          <InteractiveText text={album.artist} />
        </p>
      </div>
    </motion.div>
  );
}

export function HomeView() {
  const { playTrack, currentTrack, isPlaying, setPlaylist, addToQueue, notify } = usePlayer();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [liveTracks, setLiveTracks] = useState<Track[]>([]);
  const [liveAlbums, setLiveAlbums] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial Data Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      const [tracks, albums] = await Promise.all([
        fetchTopTracks('pop'),
        fetchAlbums('pop')
      ]);

      const finalTracks = tracks.length > 0 ? tracks : MOCK_TRACKS;
      setLiveTracks(finalTracks);
      setLiveAlbums(albums.length > 0 ? albums : MOCK_ALBUMS);
      if (finalTracks.length > 0) setPlaylist(finalTracks);
      setIsLoading(false);
    };
    loadData();
  }, [setPlaylist]);

  // Handle Search Fetching
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsLoading(true);
        const [tracks, albums] = await Promise.all([
          fetchTopTracks(searchQuery),
          fetchAlbums(searchQuery)
        ]);

        setLiveTracks(tracks);
        setLiveAlbums(albums);
        if (tracks.length > 0) setPlaylist(tracks);
        setIsLoading(false);
      } else {
        // Reset back to defaults if empty search
        const loadData = async () => {
          setIsLoading(true);
          const [tracks, albums] = await Promise.all([
            fetchTopTracks('pop'),
            fetchAlbums('pop')
          ]);

          const finalTracks = tracks.length > 0 ? tracks : MOCK_TRACKS;
          setLiveTracks(finalTracks);
          setLiveAlbums(albums.length > 0 ? albums : MOCK_ALBUMS);
          if (finalTracks.length > 0) setPlaylist(finalTracks);
          setIsLoading(false);
        };
        loadData();
      }
    }, 500); // 500ms debounce
    return () => clearTimeout(timeoutId);
  }, [searchQuery, setPlaylist]);


  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar relative">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-base/80 backdrop-blur-xl border-b border-glass-border px-10 pt-10 pb-6 flex items-center justify-between transition-colors">
        <div className="relative w-full max-w-md hidden md:block group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-text-main transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Artists, songs, or podcasts" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-glass border border-glass-border rounded-full py-2.5 pl-11 pr-10 text-[14px] text-text-main placeholder:text-text-dim focus:outline-none focus:bg-glass/80 focus:border-glass-border transition-all font-medium backdrop-blur-md"
          />
          {isSearching && !isLoading && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-text-main transition-colors"
            >
              <X size={16} />
            </button>
          )}
          {isLoading && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim">
              <Loader2 size={16} className="animate-spin" />
            </div>
          )}
        </div>
        
        <div className="md:hidden flex-1 relative mr-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={16} />
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-glass border border-glass-border rounded-full py-2 pl-9 pr-4 text-[14px] text-text-main focus:outline-none focus:bg-glass/80"
          />
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <button className="w-10 h-10 rounded-full bg-glass hover:bg-glass/80 border border-glass-border flex items-center justify-center transition-colors text-text-dim hover:text-text-main">
            <Bell size={18} />
          </button>
        </div>
      </header>

      <div className="px-10 pb-10 pt-8 space-y-12">
        <AnimatePresence mode="popLayout">
          {(!isSearching || liveAlbums.length > 0) && (
            <motion.section 
              key="albums"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div className="flex items-end justify-between mb-8">
                <h2 className="text-[32px] font-bold tracking-[-1px] text-white/90 mb-1">
                  <InteractiveText text={isSearching ? 'Albums & EPs' : 'Pick up where you left off'} mode="word" />
                </h2>
                {!isSearching && (
                  <button className="text-[13px] font-black uppercase tracking-[2px] text-accent hover:text-white flex items-center gap-1 transition-all">
                    <InteractiveText text="Show all" /> <ChevronRight size={16} />
                  </button>
                )}
              </div>
              
              <div className="flex gap-8 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 snap-x">
                {liveAlbums.slice(0, 12).map((album, idx) => (
                  <div key={album.id} className="w-[200px] shrink-0 snap-start">
                    <AlbumCard 
                      album={album} 
                      index={idx} 
                      onPlay={(a) => {
                        if (a.trackId && liveTracks.length > 0) {
                          const track = liveTracks.find(t => t.id === a.trackId) || liveTracks[0];
                          playTrack(track);
                        } else if (liveTracks.length > 0) {
                          playTrack(liveTracks[0]);
                        }
                      }} 
                    />
                  </div>
                ))}
              </div>

              {!isSearching && (
                <div className="mt-12">
                  <div className="flex items-end justify-between mb-8">
                    <h2 className="text-[32px] font-bold tracking-[-1px] text-white/90 mb-1">
                      <InteractiveText text="Latest Release" mode="word" />
                    </h2>
                  </div>
                  
                  {liveTracks.length > 0 && (
                    <motion.div 
                      whileHover={{ scale: 1.01 }}
                      onClick={() => playTrack(liveTracks[liveTracks.length - 1])}
                      className="relative w-full h-[240px] rounded-[32px] overflow-hidden group cursor-pointer border border-white/10 shadow-2xl mb-12"
                    >
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={liveTracks[liveTracks.length - 1].coverUrl} 
                          alt="Latest Release" 
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 brightness-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                      </div>
                      
                      <div className="relative z-10 h-full flex flex-col justify-center px-12">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                          <span className="text-[10px] font-black uppercase tracking-[3px] text-accent">Hot New Release</span>
                        </div>
                        <h3 className="text-[48px] font-black text-white leading-none tracking-tighter italic mb-2">
                          {liveTracks[liveTracks.length - 1].title}
                        </h3>
                        <p className="text-[18px] font-bold text-white/60 mb-8 max-w-md">
                          By {liveTracks[liveTracks.length - 1].artist} • Single • 2026
                        </p>
                        
                        <div className="flex items-center gap-4">
                          <button 
                            className="bg-white text-black px-8 py-3 rounded-full font-black uppercase text-[12px] tracking-[2px] flex items-center gap-2 hover:bg-accent hover:text-white transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
                          >
                            Listen Now <Play size={16} fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-end justify-between mb-8">
                    <h2 className="text-[32px] font-bold tracking-[-1px] text-white/90 mb-1">
                      <InteractiveText text="New releases for you" mode="word" />
                    </h2>
                  </div>
                  <div className="flex gap-8 overflow-x-auto no-scrollbar pb-8 -mx-4 px-4 snap-x">
                    {liveAlbums.slice(6, 18).map((album, idx) => (
                      <div key={album.id} className="w-[200px] shrink-0 snap-start">
                        <AlbumCard 
                          album={album} 
                          index={idx + 6} 
                          onPlay={(a) => {
                            if (a.trackId && liveTracks.length > 0) {
                              const track = liveTracks.find(t => t.id === a.trackId) || liveTracks[0];
                              playTrack(track);
                            } else if (liveTracks.length > 0) {
                              playTrack(liveTracks[0]);
                            }
                          }} 
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.section>
          )}

          {(!isSearching || liveTracks.length > 0) && (
            <motion.section 
              key="tracks"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h2 className="text-[24px] font-bold tracking-tight text-white mb-6">
                <InteractiveText text={isSearching ? 'Songs' : 'Trending Now'} mode="word" />
              </h2>
              <div className="flex flex-col gap-3">
                {liveTracks.slice(0, 20).map((track, idx) => {
                  const isActive = currentTrack?.id === track.id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={`${track.id}-${idx}`}
                      onClick={() => playTrack(track)}
                      className={`group flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                        isActive ? 'bg-accent/10 border-accent/30' : 'bg-glass border-glass-border hover:bg-glass/80 hover:border-white/20'
                      }`}
                    >
                      <div className="w-6 text-center text-[13px] font-medium text-text-dim">
                        {isActive ? (
                          <div className="flex items-center justify-center gap-0.5 h-4">
                            <motion.div animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-accent rounded-full" />
                            <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-accent rounded-full" />
                            <motion.div animate={{ height: [6, 10, 6] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1 bg-accent rounded-full" />
                          </div>
                        ) : (
                          <div className="group-hover:hidden">
                            <InteractiveText text={(idx + 1).toString()} mode="letter" />
                          </div>
                        )}
                        {!isActive && <Play size={14} className="hidden group-hover:block mx-auto text-white" fill="currentColor" />}
                      </div>
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-glass-border shadow-md">
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <Play size={16} fill="white" className="text-white" />
                        </div>
                        {isActive && !isPlaying && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <Play size={16} fill="white" className="text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 overflow-hidden shrink-0 min-w-0">
                        <h4 className={`text-[15px] font-bold truncate ${isActive ? 'text-accent' : 'text-white'}`}>
                          <InteractiveText text={track.title} mode="word" active={isActive} />
                        </h4>
                        <p className="text-[13px] text-text-dim truncate flex items-center gap-2 mt-0.5 font-medium">
                          <span className="uppercase text-[9px] px-1 py-0.5 bg-glass border border-glass-border rounded text-text-dim font-bold"><InteractiveText text="E" /></span>
                          <InteractiveText text={track.artist} />
                        </p>
                      </div>
                      <div className="hidden md:block w-1/3 text-[13px] text-text-dim truncate shrink-0 font-medium">
                        <InteractiveText text={track.album} />
                      </div>
                      <div className="w-16 text-right text-[13px] text-text-dim font-mono shrink-0 font-bold mr-4">
                        <InteractiveText text={`${Math.floor(track.duration / 60)}:${Math.floor(track.duration % 60).toString().padStart(2, '0')}`} mode="letter" />
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToQueue(track);
                          notify(`Added "${track.title}" to Queue`);
                        }}
                        className="p-2 rounded-full hover:bg-white/10 text-text-dim hover:text-white transition-all opacity-0 group-hover:opacity-100"
                        title="Add to queue"
                      >
                        <ListPlus size={18} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.section>
          )}

          {!isLoading && isSearching && liveTracks.length === 0 && liveAlbums.length === 0 && (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-text-dim"
            >
              <Search className="mx-auto mb-4 opacity-50 text-text-dim" size={48} />
              <p className="text-[15px] font-medium text-glow">No results found for "{searchQuery}"</p>
              <p className="text-[13px] mt-2"><InteractiveText text="Try searching for something else." /></p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
