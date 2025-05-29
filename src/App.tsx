import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import BlackBox from './components/BlackBox';
import Footer from './components/Footer';
import StealthMode from './components/StealthMode';
import { ShortcutProvider } from './context/ShortcutContext';

function App() {
  const [isStealthMode, setIsStealthMode] = useState(false);

  // Keyboard shortcut handling for stealth mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt+S to toggle stealth mode
      if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault();
        setIsStealthMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <ShortcutProvider>
      <div className="min-h-screen flex flex-col bg-cyber-black text-white relative">
        {/* Scanline effect */}
        <div className="scanline"></div>
        
        {isStealthMode ? (
          <StealthMode setIsStealthMode={setIsStealthMode} />
        ) : (
          <>
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
              <BlackBox />
            </main>
            <Footer />
          </>
        )}
      </div>
    </ShortcutProvider>
  );
}

export default App;