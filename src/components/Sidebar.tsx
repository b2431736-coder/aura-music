import React from 'react';
import { Home, Compass, Radio, Library, Music, Users, Mic2, Zap, Play, Search, Heart } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';
import { InteractiveText } from './InteractiveText';
import { motion } from 'motion/react';

export function Sidebar() {
  const { recentlyPlayed, playTrack, currentView, setCurrentView, notify } = usePlayer();

  const handleNav = (view: string) => {
    setCurrentView(view);
    if (view !== 'Home' && view !== 'Mashup Studio') {
      notify(`Switching to ${view} View`);
    }
  };

  return (
    <aside className="w-[280px] h-full flex flex-col px-6 py-10 bg-black/20 backdrop-blur-[50px] border-r border-white/5 z-10 hidden lg:flex relative">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />
      
      {/* Brand */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="px-4 mb-10 flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)]">
          <Zap size={22} className="text-white fill-white" />
        </div>
        <div>
          <h1 className="font-black text-[20px] tracking-tight text-white leading-none">
            AURA
          </h1>
          <span className="text-[10px] text-accent font-black tracking-[4px] opacity-80">STREAM</span>
        </div>
      </motion.div>

      {/* Nav Menu */}
      <div className="flex flex-col gap-10 flex-1 overflow-y-auto no-scrollbar pb-10 relative z-10">
        <div className="flex flex-col gap-1">
          <div className="px-4 text-[10px] uppercase tracking-[4px] text-white/30 font-black mb-3">Discovery</div>
          <NavItem icon={<Home size={20} />} label="Home" active={currentView === 'Home'} onClick={() => handleNav('Home')} accentColor="#3b82f6" />
          <NavItem icon={<Search size={20} />} label="Search" active={currentView === 'Search'} onClick={() => handleNav('Search')} accentColor="#10b981" />
          <NavItem icon={<Compass size={20} />} label="Browse" active={currentView === 'Browse'} onClick={() => handleNav('Browse')} accentColor="#f59e0b" />
          <NavItem icon={<Radio size={20} />} label="Radio" active={currentView === 'Radio'} onClick={() => handleNav('Radio')} accentColor="#ef4444" />
        </div>

        <div className="flex flex-col gap-1">
          <div className="px-4 text-[10px] uppercase tracking-[4px] text-white/30 font-black mb-3">Your Space</div>
          <NavItem icon={<Library size={20} />} label="Library" active={currentView === 'Library'} onClick={() => handleNav('Library')} accentColor="#8b5cf6" />
          <NavItem icon={<Users size={20} />} label="Artists" active={currentView === 'Artists'} onClick={() => handleNav('Artists')} accentColor="#ec4899" />
          <NavItem icon={<Heart size={20} />} label="Favorites" active={currentView === 'Favorites'} onClick={() => handleNav('Favorites')} accentColor="#f43f5e" />
          <NavItem icon={<Music size={20} />} label="Songs" active={currentView === 'Songs'} onClick={() => handleNav('Songs')} accentColor="#06b6d4" />
          <NavItem 
            icon={<Zap size={20} />} 
            label="Synthesis Lab" 
            active={false}
            onClick={() => window.dispatchEvent(new CustomEvent('toggle-mashup'))}
            accentColor="#7c3aed"
            isFeatured
          />
        </div>

        {/* Recently Played */}
        <div className="flex flex-col gap-5 px-4 mt-2">
          <div className="text-[10px] uppercase tracking-[4px] text-white/30 font-black">Pulse</div>
          <div className="space-y-5">
            {recentlyPlayed.slice(0, 4).map((track, idx) => (
              <motion.div 
                key={track.id} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center gap-4 cursor-pointer group/track"
                onClick={() => playTrack(track)}
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 relative shadow-lg group-hover/track:shadow-accent/20 transition-all duration-500">
                  <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover transition-transform duration-700 group-hover/track:scale-125" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/track:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-[2px]">
                    <Play size={14} className="text-white fill-white translate-y-2 group-hover/track:translate-y-0 transition-transform duration-300" />
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[13px] font-bold text-white truncate leading-tight group-hover/track:text-accent transition-colors">
                    {track.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-1 h-1 rounded-full bg-accent/40" />
                    <p className="text-[11px] text-white/40 truncate font-medium uppercase tracking-widest">{track.artist}</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {recentlyPlayed.length === 0 && (
              <div className="px-4 py-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                <p className="text-[11px] text-white/30 font-bold uppercase tracking-widest">Awaiting Echoes</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile/Footer touch */}
      <div className="mt-auto px-4 pt-6 border-t border-white/5 shrink-0">
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer border border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-purple-600 flex items-center justify-center text-white font-black">
            B
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">AI Explorer</p>
            <p className="text-[10px] text-accent uppercase tracking-widest font-black">Pro Member</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
  accentColor: string;
  isFeatured?: boolean;
}

function NavItem({ icon, label, active = false, onClick, accentColor, isFeatured }: NavItemProps) {
  return (
    <motion.button 
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex items-center gap-4 py-3 px-4 rounded-2xl transition-all duration-300 group overflow-hidden ${
        active 
          ? 'bg-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.1)]' 
          : 'hover:bg-white/5 border border-transparent'
      } ${isFeatured ? 'bg-accent/10 border-accent/20' : ''}`}
    >
      {active && (
        <motion.div 
          layoutId="sidebar-active"
          className="absolute left-0 top-3 bottom-3 w-1 bg-accent rounded-r-full"
        />
      )}
      
      <div 
        className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 shadow-sm ${
          active ? 'bg-white text-black scale-110 shadow-lg' : 'bg-black/20 text-white/50 group-hover:bg-white/10 group-hover:text-white'
        }`}
        style={{ 
          color: active ? accentColor : undefined,
          boxShadow: active ? `0 0 20px ${accentColor}44` : undefined 
        }}
      >
        <div className="relative z-10">
          {React.cloneElement(icon as React.ReactElement, { 
            size: 20,
            className: active ? 'drop-shadow-sm' : ''
          })}
        </div>
        
        {/* Abstract shape in background of icon */}
        {active && (
          <motion.div 
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.15, scale: 1 }}
            className="absolute inset-0 rounded-xl"
            style={{ backgroundColor: accentColor }}
          />
        )}
      </div>

      <span className={`text-[14px] font-black transition-all uppercase tracking-[2px] ${
        active ? 'text-white' : 'text-white/40 group-hover:text-white'
      }`}>
        <InteractiveText text={label} active={active} />
      </span>

      {isFeatured && (
        <div className="ml-auto">
          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_8px_rgba(var(--accent-rgb),0.8)]" />
        </div>
      )}
    </motion.button>
  );
}
