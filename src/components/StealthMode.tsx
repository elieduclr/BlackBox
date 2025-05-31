import React, { useState } from 'react';
import { Eye, Copy, RefreshCw, Shield, Key, Hash } from 'lucide-react';

interface StealthModeProps {
  setIsStealthMode: (isStealthMode: boolean) => void;
}

interface TokenOptions {
  length: number;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  includeUppercase: boolean;
  prefix: string;
}

const StealthMode: React.FC<StealthModeProps> = ({ setIsStealthMode }) => {
  const [tokenType, setTokenType] = useState<'uuid' | 'apikey' | 'custom'>('uuid');
  const [generatedToken, setGeneratedToken] = useState('');
  const [options, setOptions] = useState<TokenOptions>({
    length: 32,
    includeNumbers: true,
    includeSpecialChars: true,
    includeUppercase: true,
    prefix: '',
  });

  const generateUUID = () => {
    const uuid = crypto.randomUUID();
    setGeneratedToken(uuid);
  };

  const generateAPIKey = () => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const length = 32;
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    const result = new Array(length);
    const charsetLength = charset.length;
    for (let i = 0; i < length; i++) {
      result[i] = charset[randomBytes[i] % charsetLength];
    }
    setGeneratedToken(`sk_${result.join('')}`);
  };

  const generateCustomToken = () => {
    let charset = 'abcdefghijklmnopqrstuvwxyz';
    if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.includeNumbers) charset += '0123456789';
    if (options.includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const randomBytes = new Uint8Array(options.length);
    crypto.getRandomValues(randomBytes);
    const result = new Array(options.length);
    const charsetLength = charset.length;
    for (let i = 0; i < options.length; i++) {
      result[i] = charset[randomBytes[i] % charsetLength];
    }
    setGeneratedToken(`${options.prefix}${result.join('')}`);
  };

  const handleGenerate = () => {
    switch (tokenType) {
      case 'uuid':
        generateUUID();
        break;
      case 'apikey':
        generateAPIKey();
        break;
      case 'custom':
        generateCustomToken();
        break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedToken);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white">
      <header className="bg-cyber-dark border-b border-cyber-blue py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-cyber-blue" />
              <h1 className="text-xl font-cyber text-cyber-blue">SECURE TOKEN GENERATOR</h1>
            </div>
            <button 
              onClick={() => setIsStealthMode(false)}
              className="flex items-center text-cyber-purple hover:text-cyber-blue transition-colors duration-300"
              title="Exit stealth mode (Ctrl+Alt+S)"
            >
              <Eye className="w-4 h-4 mr-1" />
              <span className="font-cyber">EXIT</span>
            </button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="cyberpunk-border rounded mb-6">
            <div className="bg-cyber-dark p-6">
              <div className="grid grid-cols-3 gap-4 mb-6">
                <button
                  className={`p-4 border ${tokenType === 'uuid' ? 'border-cyber-purple bg-cyber-dark' : 'border-cyber-blue'} 
                    hover:border-cyber-purple transition-colors duration-300`}
                  onClick={() => setTokenType('uuid')}
                >
                  <Hash className="w-6 h-6 mx-auto mb-2 text-cyber-blue" />
                  <span className="block text-center font-cyber text-sm">UUID</span>
                </button>
                <button
                  className={`p-4 border ${tokenType === 'apikey' ? 'border-cyber-purple bg-cyber-dark' : 'border-cyber-blue'} 
                    hover:border-cyber-purple transition-colors duration-300`}
                  onClick={() => setTokenType('apikey')}
                >
                  <Key className="w-6 h-6 mx-auto mb-2 text-cyber-blue" />
                  <span className="block text-center font-cyber text-sm">API KEY</span>
                </button>
                <button
                  className={`p-4 border ${tokenType === 'custom' ? 'border-cyber-purple bg-cyber-dark' : 'border-cyber-blue'} 
                    hover:border-cyber-purple transition-colors duration-300`}
                  onClick={() => setTokenType('custom')}
                >
                  <Shield className="w-6 h-6 mx-auto mb-2 text-cyber-blue" />
                  <span className="block text-center font-cyber text-sm">CUSTOM</span>
                </button>
              </div>

              {tokenType === 'custom' && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-cyber text-cyber-blue mb-2">LENGTH</label>
                    <input
                      type="number"
                      value={options.length}
                      onChange={(e) => setOptions({...options, length: parseInt(e.target.value)})}
                      className="cyber-input"
                      min="8"
                      max="128"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-cyber text-cyber-blue mb-2">PREFIX</label>
                    <input
                      type="text"
                      value={options.prefix}
                      onChange={(e) => setOptions({...options, prefix: e.target.value})}
                      className="cyber-input"
                      placeholder="Optional prefix"
                    />
                  </div>
                  <div className="col-span-2 grid grid-cols-3 gap-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.includeNumbers}
                        onChange={(e) => setOptions({...options, includeNumbers: e.target.checked})}
                        className="form-checkbox text-cyber-purple"
                      />
                      <span className="font-cyber text-sm">NUMBERS</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.includeSpecialChars}
                        onChange={(e) => setOptions({...options, includeSpecialChars: e.target.checked})}
                        className="form-checkbox text-cyber-purple"
                      />
                      <span className="font-cyber text-sm">SPECIAL CHARS</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={options.includeUppercase}
                        onChange={(e) => setOptions({...options, includeUppercase: e.target.checked})}
                        className="form-checkbox text-cyber-purple"
                      />
                      <span className="font-cyber text-sm">UPPERCASE</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex justify-center mb-6">
                <button
                  onClick={handleGenerate}
                  className="cyberpunk-button flex items-center"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  GENERATE TOKEN
                </button>
              </div>

              {generatedToken && (
                <div className="relative">
                  <div className="bg-cyber-black border border-cyber-green p-4 font-mono break-all">
                    {generatedToken}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="absolute top-2 right-2 text-cyber-blue hover:text-cyber-purple transition-colors duration-300"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6 text-center">
            <div className="cyberpunk-border rounded p-4">
              <div className="text-cyber-blue font-cyber mb-2">ENTROPY SOURCE</div>
              <div className="text-sm">Web Crypto API</div>
            </div>
            <div className="cyberpunk-border rounded p-4">
              <div className="text-cyber-blue font-cyber mb-2">SECURITY LEVEL</div>
              <div className="text-sm">Cryptographically Secure</div>
            </div>
            <div className="cyberpunk-border rounded p-4">
              <div className="text-cyber-blue font-cyber mb-2">COMPLIANCE</div>
              <div className="text-sm">NIST SP 800-63B</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StealthMode;