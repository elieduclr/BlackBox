import React from 'react';
import { Shield, Cpu, Lock, Fingerprint } from 'lucide-react';
import { Algorithm } from '../types/crypto';

interface AlgorithmSelectorProps {
  selectedAlgorithm: Algorithm;
  setSelectedAlgorithm: (algorithm: Algorithm) => void;
}

const AlgorithmSelector: React.FC<AlgorithmSelectorProps> = ({
  selectedAlgorithm,
  setSelectedAlgorithm
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div 
        className={`algo-selector ${selectedAlgorithm === 'aes' ? 'active' : ''}`}
        onClick={() => setSelectedAlgorithm('aes')}
      >
        <div className="flex flex-col items-center text-center">
          <Lock className={`w-8 h-8 mb-2 ${selectedAlgorithm === 'aes' ? 'text-cyber-blue' : 'text-gray-400'}`} />
          <h3 className={`font-cyber ${selectedAlgorithm === 'aes' ? 'text-cyber-blue' : 'text-gray-400'}`}>AES-256</h3>
          <p className="text-xs mt-1 text-gray-500">Industry Standard</p>
        </div>
      </div>
      
      <div 
        className={`algo-selector ${selectedAlgorithm === 'chacha' ? 'active' : ''}`}
        onClick={() => setSelectedAlgorithm('chacha')}
      >
        <div className="flex flex-col items-center text-center">
          <Shield className={`w-8 h-8 mb-2 ${selectedAlgorithm === 'chacha' ? 'text-cyber-blue' : 'text-gray-400'}`} />
          <h3 className={`font-cyber ${selectedAlgorithm === 'chacha' ? 'text-cyber-blue' : 'text-gray-400'}`}>ChaCha20</h3>
          <p className="text-xs mt-1 text-gray-500">High Performance</p>
        </div>
      </div>
      
      <div 
        className={`algo-selector ${selectedAlgorithm === 'kyber' ? 'active' : ''}`}
        onClick={() => setSelectedAlgorithm('kyber')}
      >
        <div className="flex flex-col items-center text-center">
          <Cpu className={`w-8 h-8 mb-2 ${selectedAlgorithm === 'kyber' ? 'text-cyber-blue' : 'text-gray-400'}`} />
          <h3 className={`font-cyber ${selectedAlgorithm === 'kyber' ? 'text-cyber-blue' : 'text-gray-400'}`}>Kyber</h3>
          <p className="text-xs mt-1 text-gray-500">Post-Quantum</p>
        </div>
      </div>
      
      <div 
        className={`algo-selector ${selectedAlgorithm === 'custom' ? 'active' : ''}`}
        onClick={() => setSelectedAlgorithm('custom')}
      >
        <div className="flex flex-col items-center text-center">
          <Fingerprint className={`w-8 h-8 mb-2 ${selectedAlgorithm === 'custom' ? 'text-cyber-blue' : 'text-gray-400'}`} />
          <h3 className={`font-cyber ${selectedAlgorithm === 'custom' ? 'text-cyber-blue' : 'text-gray-400'}`}>Custom</h3>
          <p className="text-xs mt-1 text-gray-500">Proprietary Blend</p>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmSelector;