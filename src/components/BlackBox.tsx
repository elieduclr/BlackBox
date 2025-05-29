import React, { useState } from 'react';
import AlgorithmSelector from './AlgorithmSelector';
import Encryptor from './Encryptor';
import Visualizer from './Visualizer';
import VisualObfuscation from './VisualObfuscation';
import { Algorithm } from '../types/crypto';

const BlackBox: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<Algorithm>('aes');
  const [isEncrypting, setIsEncrypting] = useState(true);
  const [showVisualObfuscation, setShowVisualObfuscation] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState('');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-3 space-y-6">
        <div className="cyberpunk-border rounded">
          <div className="bg-cyber-dark p-4 rounded">
            <h2 className="text-xl font-display text-cyber-blue mb-4 flex items-center">
              <span className="inline-block w-3 h-3 bg-cyber-green mr-2"></span>
              CRYPTOGRAPHIC INTERFACE
            </h2>
            
            <Encryptor 
              inputText={inputText}
              setInputText={setInputText}
              outputText={outputText}
              setOutputText={setOutputText}
              isEncrypting={isEncrypting}
              setIsEncrypting={setIsEncrypting}
              onSubmit={() => {}}
              isProcessing={isProcessing}
              encryptionKey={encryptionKey}
              setEncryptionKey={setEncryptionKey}
              selectedAlgorithm={selectedAlgorithm}
            />
          </div>
        </div>
        
        <div className="cyberpunk-border rounded">
          <div className="bg-cyber-dark p-4 rounded">
            <h2 className="text-xl font-display text-cyber-blue mb-4 flex items-center">
              <span className="inline-block w-3 h-3 bg-cyber-purple mr-2"></span>
              VISUAL REPRESENTATION
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-cyber text-cyber-yellow">
                DATA VISUALIZATION
              </span>
              <label className="inline-flex items-center cursor-pointer">
                <span className="mr-2 text-sm font-cyber text-cyber-green">OBFUSCATION MODE</span>
                <div className="relative">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={showVisualObfuscation}
                    onChange={() => setShowVisualObfuscation(!showVisualObfuscation)} 
                  />
                  <div className="w-10 h-5 bg-cyber-dark border border-cyber-blue rounded-full"></div>
                  <div className={`absolute left-1 top-1 w-3 h-3 transition-transform duration-300 ${
                    showVisualObfuscation ? 'translate-x-5 bg-cyber-green' : 'bg-cyber-blue'
                  }`}></div>
                </div>
              </label>
            </div>
            
            {showVisualObfuscation ? (
              <VisualObfuscation 
                text={outputText} 
                algorithm={selectedAlgorithm} 
              />
            ) : (
              <Visualizer 
                inputText={inputText}
                outputText={outputText}
                algorithm={selectedAlgorithm}
                isEncrypting={isEncrypting}
                isProcessing={isProcessing}
              />
            )}
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-2 space-y-6">
        <div className="cyberpunk-border rounded">
          <div className="bg-cyber-dark p-4 rounded">
            <h2 className="text-xl font-display text-cyber-blue mb-4 flex items-center">
              <span className="inline-block w-3 h-3 bg-cyber-red mr-2"></span>
              ALGORITHM SELECTION
            </h2>
            
            <AlgorithmSelector 
              selectedAlgorithm={selectedAlgorithm}
              setSelectedAlgorithm={setSelectedAlgorithm}
            />
          </div>
        </div>
        
        <div className="cyberpunk-border rounded">
          <div className="bg-cyber-dark p-4 rounded">
            <h2 className="text-xl font-display text-cyber-purple mb-2">ALGORITHM INFO</h2>
            <div className="font-cyber text-sm">
              {selectedAlgorithm === 'aes' && (
                <div>
                  <p className="mb-2 text-cyber-yellow">AES-256 (Advanced Encryption Standard)</p>
                  <p className="text-gray-300 mb-2">
                    Symmetric key algorithm using 128/192/256-bit keys.
                    Standard for securing sensitive data worldwide.
                  </p>
                  <p className="text-cyber-green">STATUS: ACTIVE // QUANTUM RESISTANCE: LOW</p>
                </div>
              )}
              
              {selectedAlgorithm === 'chacha' && (
                <div>
                  <p className="mb-2 text-cyber-yellow">ChaCha20-Poly1305</p>
                  <p className="text-gray-300 mb-2">
                    Stream cipher designed for high-speed encryption on any CPU.
                    Used in TLS for HTTPS connections.
                  </p>
                  <p className="text-cyber-green">STATUS: ACTIVE // QUANTUM RESISTANCE: LOW</p>
                </div>
              )}
              
              {selectedAlgorithm === 'kyber' && (
                <div>
                  <p className="mb-2 text-cyber-yellow">Kyber (Simulated)</p>
                  <p className="text-gray-300 mb-2">
                    Post-quantum key encapsulation mechanism.
                    Based on module lattice problems believed resistant to quantum attacks.
                  </p>
                  <p className="text-cyber-green">STATUS: EXPERIMENTAL // QUANTUM RESISTANCE: HIGH</p>
                </div>
              )}
              
              {selectedAlgorithm === 'custom' && (
                <div>
                  <p className="mb-2 text-cyber-yellow">BlackBox Custom Algorithm</p>
                  <p className="text-gray-300 mb-2">
                    Proprietary hybrid encryption using multiple ciphers in sequence.
                    Implements key stretching and multi-layered encryption.
                  </p>
                  <p className="text-cyber-red">STATUS: PROTOTYPE // QUANTUM RESISTANCE: MEDIUM</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlackBox;