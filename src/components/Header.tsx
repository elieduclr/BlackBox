import React from 'react';
import { Shield, Lock } from 'lucide-react';
import { useShortcut } from '../context/ShortcutContext';

const Header: React.FC = () => {
  const { registerShortcut } = useShortcut();

  return (
    <header className="bg-cyber-dark border-b border-cyber-blue py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 flex items-center justify-center">
            <Lock className="w-8 h-8 text-cyber-green" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-cyber text-cyber-blue">
              BlackBox
            </h1>
            <p className="text-xs text-cyber-yellow font-cyber">v1.0.0 // CRYPTOGRAPHIC ENGINE</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <div 
            className="flex items-center space-x-2 bg-cyber-dark border border-cyber-red px-3 py-2 text-sm"
            title="Press Ctrl+Alt+S to toggle stealth mode"
          >
            <Shield className="w-4 h-4 text-cyber-red" />
            <span className="hidden sm:inline text-cyber-red font-cyber">CTRL+ALT+S: STEALTH MODE</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;