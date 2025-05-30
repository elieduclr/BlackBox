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

  // Calculate password strength
  const calculatePasswordStrength = (password: string): {
    score: number;
    color: string;
    label: string;
  } => {
    let score = 0;
    
    // Length check (weighted more heavily)
    if (password.length >= 20) score += 5;
    else if (password.length >= 16) score += 4;
    else if (password.length >= 12) score += 3;
    else if (password.length >= 8) score += 2;
    else if (password.length >= 6) score += 1;
    
    // Character variety checks
    if (/[A-Z]/.test(password)) score += 2;
    if (/[a-z]/.test(password)) score += 2;
    if (/[0-9]/.test(password)) score += 2;
    if (/[^A-Za-z0-9]/.test(password)) score += 2;
    
    // Advanced character checks
    if (/[!@#$%^&*()_+={}\[\]|\\:";'<>?,.\/~`]/.test(password)) score += 2; // Special symbols
    if (/[À-ÿ]/.test(password)) score += 1; // Accented characters
    if (password.length >= 24) score += 2; // Extra length bonus
    if (password.length >= 32) score += 2; // Exceptional length bonus
    
    // Pattern and security checks (bonuses)
    if (!/(.)\1{2,}/.test(password)) score += 2; // No repeated characters (3+)
    if (!/(.)\1/.test(password)) score += 1; // No repeated characters (2+)
    
    // Mixed case within words (increases entropy)
    if (/[a-z].*[A-Z]|[A-Z].*[a-z]/.test(password) && password.length >= 8) score += 2;
    
    // Numbers not at the end (better distribution)
    if (/[0-9]/.test(password) && !/\d+$/.test(password)) score += 1;
    
    // Multiple character types mixed throughout
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])/.test(password)) score += 3;
    
    // Character diversity bonus (4+ different character types)
    const charTypes = [
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /[0-9]/.test(password),
      /[!@#$%^&*()_+={}\[\]|\\:";'<>?,.\/~`]/.test(password),
      /[À-ÿ]/.test(password)
    ].filter(Boolean).length;
    if (charTypes >= 4) score += 2;
    
    // SECURITY PENALTIES (these reduce the score)
    
    // Sequential patterns check (abc, 123, etc.) - PENALTY
    const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|012|987|876|765|654|543|432|321|210)/i.test(password);
    if (hasSequential) score -= 4;
    
    // Common patterns check (password variations, etc.) - PENALTY
    const commonPatterns = /(?:password|passwd|pass|123456|654321|qwerty|azerty|admin|login|welcome|letmein|monkey|dragon|master|shadow|abc123|123abc|password123|admin123|root|user|guest|test|demo|sample|example|default|temp|temporary)/i;
    if (commonPatterns.test(password)) score -= 6;
    
    // Keyboard patterns check (qwerty, asdf, etc.) - PENALTY
    const keyboardPatterns = /(?:qwer|wert|erty|rtyu|tyui|yuio|uiop|asdf|sdfg|dfgh|fghj|ghjk|hjkl|zxcv|xcvb|cvbn|vbnm|1234|2345|3456|4567|5678|6789|7890|0987|9876|8765|7654|6543|5432|4321|3210)/i;
    if (keyboardPatterns.test(password)) score -= 4;
    
    // Date patterns check (19xx, 20xx, dd/mm, mm/dd) - PENALTY
    const datePatterns = /(?:19\d{2}|20\d{2}|21\d{2}|\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}|\d{8})/;
    if (datePatterns.test(password)) score -= 3;
    
    // Phone number patterns - PENALTY
    const phonePatterns = /(?:\d{10}|\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4})/;
    if (phonePatterns.test(password)) score -= 3;
    
    // Repetitive patterns - PENALTY
    const repetitivePatterns = /(.{2,})\1{2,}/;
    if (repetitivePatterns.test(password)) score -= 3;
    
    // All same case - PENALTY
    if (password === password.toLowerCase() || password === password.toUpperCase()) {
      if (password.length > 6) score -= 2;
    }
    
    // Only numbers or only letters - PENALTY
    if (/^\d+$/.test(password) || /^[a-zA-Z]+$/i.test(password)) {
      if (password.length > 6) score -= 3;
    }
    
    // Personal info patterns (name-like, email-like) - PENALTY
    const personalPatterns = /(?:john|jane|mike|sarah|david|maria|alex|chris|admin|user|guest|[a-z]+\d{1,4}$|^\d{1,4}[a-z]+)/i;
    if (personalPatterns.test(password)) score -= 2;
    
    // Ensure minimum score
    score = Math.max(0, score);
    
    // Apply length penalty for very short passwords
    if (password.length < 6) score = Math.max(0, score - 5);
    if (password.length < 4) score = 0;
    
    // Return score with corresponding color and label
    switch (true) {
      case score === 0:
        return { score, color: '#8B0000', label: 'VERY WEAK' };
      case score <= 3:
        return { score, color: '#FF073A', label: 'WEAK' };
      case score <= 6:
        return { score, color: '#FF4500', label: 'POOR' };
      case score <= 10:
        return { score, color: '#FF8C00', label: 'FAIR' };
      case score <= 14:
        return { score, color: '#FFD700', label: 'MODERATE' };
      case score <= 18:
        return { score, color: '#9ACD32', label: 'GOOD' };
      case score <= 22:
        return { score, color: '#39FF14', label: 'STRONG' };
      case score <= 26:
        return { score, color: '#00FF7F', label: 'VERY STRONG' };
      default:
        return { score, color: '#0AFFFF', label: 'EXCEPTIONAL' };
    }
  };

  const strength = calculatePasswordStrength(encryptionKey);
  const strengthSegments = 7;
  const activeSegments = Math.ceil((strength.score / 30) * strengthSegments);
  
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
          <div className="space-y-2">
            <input
              type="password"
              value={encryptionKey}
              onChange={(e) => setEncryptionKey(e.target.value)}
              className="cyber-input"
              placeholder="Enter encryption key"
            />
            {encryptionKey && (
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <div className="flex-1 grid grid-cols-7 gap-1">
                    {Array.from({ length: strengthSegments }).map((_, i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full transition-all duration-300"
                        style={{
                          backgroundColor: i < activeSegments ? strength.color : 'rgba(255, 255, 255, 0.1)'
                        }}
                      />
                    ))}
                  </div>
                  <span 
                    className="ml-3 text-xs font-cyber"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="text-xs text-gray-500 font-cyber">
                  {strength.score < 4 && 'TIP: USE UPPERCASE, LOWERCASE, NUMBERS, AND SYMBOLS'}
                </div>
              </div>
            )}
          </div>
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