import React, { useState, useEffect } from 'react';
import { PlayerProvider } from './contexts/PlayerContext';
import { Sidebar } from './components/Sidebar';
import { PlayerControls } from './components/PlayerControls';
import { HomeView } from './components/HomeView';
import { LyricsView } from './components/LyricsView';
import { QueueView } from './components/QueueView';
import { FloatingNotification } from './components/FloatingNotification';
import { MashupView } from './components/MashupView';
import { motion, AnimatePresence } from 'motion/react';
import { usePlayer } from './contexts/PlayerContext';
import { Music, Sparkles } from 'lucide-react';

function ComingSoonView({ name }: { name: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col items-center justify-center p-20 text-center"
    >
      <div className="w-24 h-24 rounded-full bg-accent/10 flex items-center justify-center mb-8 relative">
        <Sparkles className="text-accent absolute -top-2 -right-2 animate-bounce" size={32} />
        <Music className="text-accent/40" size={48} />
      </div>
      <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">
        {name} <span className="text-accent">Locked</span>
      </h2>
      <p className="text-text-dim max-w-md font-medium leading-relaxed">
        Our Neural Synthesis Engine is processing the data for this dimension. 
        Higher fidelity streaming for {name} will be online shortly.
      </p>
    </motion.div>
  );
}

function AppContent() {
  const [showMashup, setShowMashup] = useState(false);
  const { showQueue, toggleQueue, currentView } = usePlayer();

  useEffect(() => {
    const handleToggle = () => setShowMashup(prev => !prev);
    window.addEventListener('toggle-mashup', handleToggle);
    return () => window.removeEventListener('toggle-mashup', handleToggle);
  }, []);

  return (
    <div className="flex flex-col h-screen w-full bg-bg-base text-text-main overflow-hidden relative">
      <div className="atmosphere"></div>
      
      <div className="flex w-full flex-1 overflow-hidden relative z-10">
        <Sidebar />
        <main className="flex-1 flex flex-col relative w-full h-full z-10">
          <AnimatePresence mode="wait">
             {currentView === 'Home' ? (
                <motion.div 
                  key="home"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex-1 overflow-hidden flex flex-col"
                >
                  <HomeView />
                </motion.div>
             ) : (
                <ComingSoonView name={currentView} />
             )}
          </AnimatePresence>
        </main>
      </div>
      
      <LyricsView />

      <AnimatePresence>
        {showQueue && (
          <QueueView onClose={toggleQueue} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showMashup && (
          <MashupView onClose={() => setShowMashup(false)} />
        )}
      </AnimatePresence>

      <div className="z-50 relative w-full">
        <PlayerControls />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PlayerProvider>
      <FloatingNotification />
      <AppContent />
    </PlayerProvider>
  );
}
