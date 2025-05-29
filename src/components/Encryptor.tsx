import React, { useState } from 'react';
import { Lock, Unlock, RefreshCw, Copy, ArrowRight } from 'lucide-react';
import * as cryptoService from '../services/crypto';
import { Algorithm } from '../types/crypto';

interface EncryptorProps {
  inputText: string;
  setInputText: (text: string) => void;
  outputText: string;
  setOutputText: (text: string) => void;
  isEncrypting: boolean;
  setIsEncrypting: (isEncrypting: boolean) => void;
  onSubmit: () => void;
  isProcessing: boolean;
  encryptionKey: string;
  setEncryptionKey: (key: string) => void;
  selectedAlgorithm: Algorithm;
}

const Encryptor: React.FC<EncryptorProps> = ({
  inputText,
  setInputText,
  outputText,
  setOutputText,
  isEncrypting,
  setIsEncrypting,
  isProcessing,
  encryptionKey,
  setEncryptionKey,
  selectedAlgorithm
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleProcess = async () => {
    if (!inputText || !encryptionKey) return;
    
    setError(null);
    setOutputText('');
    
    try {
      const result = isEncrypting
        ? await cryptoService.encrypt(inputText, encryptionKey, selectedAlgorithm)
        : await cryptoService.decrypt(inputText, encryptionKey, selectedAlgorithm);
      
      if (!result.success || !result.result) {
        throw new Error(result.error || 'Operation failed');
      }
      
      setOutputText(result.result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleCopyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <button
            className={`cyberpunk-button ${isEncrypting ? 'bg-cyber-dark' : 'bg-transparent'}`}
            onClick={() => setIsEncrypting(true)}
          >
            <Lock className="w-4 h-4 mr-1 inline" />
            ENCRYPT
          </button>
          <button
            className={`cyberpunk-button ${!isEncrypting ? 'bg-cyber-dark' : 'bg-transparent'}`}
            onClick={() => setIsEncrypting(false)}
          >
            <Unlock className="w-4 h-4 mr-1 inline" />
            DECRYPT
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-cyber text-cyber-blue mb-1">
            ENCRYPTION KEY
          </label>
          <input
            type="password"
            value={encryptionKey}
            onChange={(e) => setEncryptionKey(e.target.value)}
            className="cyber-input"
            placeholder="Enter encryption key"
          />
        </div>
        
        <div>
          <label className="block text-sm font-cyber text-cyber-blue mb-1">
            {isEncrypting ? 'PLAINTEXT INPUT' : 'ENCRYPTED INPUT'}
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="cyber-input h-32 resize-none"
            placeholder={isEncrypting ? "Enter text to encrypt..." : "Enter text to decrypt..."}
          />
        </div>
        
        {error && (
          <div className="text-cyber-red font-cyber text-sm p-2 border border-cyber-red">
            {error}
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            className="cyberpunk-button flex items-center"
            onClick={handleProcess}
            disabled={isProcessing || !inputText || !encryptionKey}
          >
            {isProcessing ? (
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="w-5 h-5 mr-2" />
            )}
            {isEncrypting ? 'ENCRYPT' : 'DECRYPT'}
          </button>
        </div>
        
        {outputText && (
          <div>
            <div className="flex justify-between items-center">
              <label className="block text-sm font-cyber text-cyber-green mb-1">
                {isEncrypting ? 'ENCRYPTED OUTPUT' : 'DECRYPTED OUTPUT'}
              </label>
              <button
                onClick={handleCopyToClipboard}
                className="text-cyber-yellow hover:text-cyber-blue transition-colors duration-200"
                title="Copy to clipboard"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-cyber-black border border-cyber-green p-3 font-cyber text-cyber-green overflow-x-auto">
              {outputText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Encryptor;