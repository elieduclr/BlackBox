import React from 'react';
import { Github, Shield } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-cyber-dark border-t border-cyber-blue py-4 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-cyber-green" />
            <span className="font-cyber text-cyber-green">OPEN SOURCE CRYPTOGRAPHY</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <a 
              href="#" 
              className="text-cyber-blue hover:text-cyber-purple transition-colors duration-300 flex items-center space-x-1"
            >
              <Github className="w-4 h-4" />
              <span>SOURCE</span>
            </a>
            <span className="text-gray-500 font-cyber">[ RUNS 100% CLIENT-SIDE ]</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;