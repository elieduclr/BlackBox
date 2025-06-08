import React, { useState, useRef } from 'react';
import { Eye, Copy, RefreshCw, Shield, Key, Hash, Download, Settings, Lock, Zap, Database, Globe, FileText, Save } from 'lucide-react';

interface StealthModeProps {
  setIsStealthMode: (isStealthMode: boolean) => void;
}

interface TokenOptions {
  length: number;
  includeNumbers: boolean;
  includeSpecialChars: boolean;
  includeUppercase: boolean;
  includeLowercase: boolean;
  excludeSimilar: boolean;
  prefix: string;
  suffix: string;
  separator: string;
  segments: number;
}

interface GeneratedToken {
  id: string;
  type: string;
  value: string;
  timestamp: Date;
  options?: Partial<TokenOptions>;
}

const StealthMode: React.FC<StealthModeProps> = ({ setIsStealthMode }) => {
  const [tokenType, setTokenType] = useState<'uuid' | 'apikey' | 'custom' | 'password' | 'jwt' | 'hash'>('uuid');
  const [generatedToken, setGeneratedToken] = useState('');
  const [tokenHistory, setTokenHistory] = useState<GeneratedToken[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [batchCount, setBatchCount] = useState(1);
  const [batchTokens, setBatchTokens] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [options, setOptions] = useState<TokenOptions>({
    length: 32,
    includeNumbers: true,
    includeSpecialChars: true,
    includeUppercase: true,
    includeLowercase: true,
    excludeSimilar: false,
    prefix: '',
    suffix: '',
    separator: '',
    segments: 1,
  });

  const generateUUID = () => {
    const uuid = crypto.randomUUID();
    return uuid;
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
    return `sk_${result.join('')}`;
  };

  const generatePassword = () => {
    let charset = '';
    if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.includeNumbers) charset += '0123456789';
    if (options.includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (options.excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    const randomBytes = new Uint8Array(options.length);
    crypto.getRandomValues(randomBytes);
    const result = new Array(options.length);
    const charsetLength = charset.length;
    for (let i = 0; i < options.length; i++) {
      result[i] = charset[randomBytes[i] % charsetLength];
    }
    return `${options.prefix}${result.join('')}${options.suffix}`;
  };

  const generateCustomToken = () => {
    let charset = '';
    if (options.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.includeNumbers) charset += '0123456789';
    if (options.includeSpecialChars) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (options.excludeSimilar) {
      charset = charset.replace(/[0O1lI]/g, '');
    }

    const segments = [];
    const segmentLength = Math.floor(options.length / options.segments);
    
    for (let s = 0; s < options.segments; s++) {
      const randomBytes = new Uint8Array(segmentLength);
      crypto.getRandomValues(randomBytes);
      const segment = new Array(segmentLength);
      const charsetLength = charset.length;
      for (let i = 0; i < segmentLength; i++) {
        segment[i] = charset[randomBytes[i] % charsetLength];
      }
      segments.push(segment.join(''));
    }
    
    return `${options.prefix}${segments.join(options.separator)}${options.suffix}`;
  };

  const generateJWT = () => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: crypto.randomUUID(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600
    }));
    
    // Generate a random signature-like string
    const randomBytes = new Uint8Array(32);
    crypto.getRandomValues(randomBytes);
    const signature = btoa(String.fromCharCode(...randomBytes)).replace(/[+/=]/g, '');
    
    return `${header}.${payload}.${signature}`;
  };

  const generateHash = async () => {
    const data = options.prefix || 'BlackBox.js-' + Date.now();
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const handleGenerate = async () => {
    let tokens: string[] = [];
    
    for (let i = 0; i < batchCount; i++) {
      let token = '';
      switch (tokenType) {
        case 'uuid':
          token = generateUUID();
          break;
        case 'apikey':
          token = generateAPIKey();
          break;
        case 'custom':
          token = generateCustomToken();
          break;
        case 'password':
          token = generatePassword();
          break;
        case 'jwt':
          token = generateJWT();
          break;
        case 'hash':
          token = await generateHash();
          break;
      }
      tokens.push(token);
    }
    
    if (batchCount === 1) {
      setGeneratedToken(tokens[0]);
      setBatchTokens([]);
    } else {
      setBatchTokens(tokens);
      setGeneratedToken('');
    }
    
    // Add to history
    const newTokens = tokens.map(token => ({
      id: crypto.randomUUID(),
      type: tokenType.toUpperCase(),
      value: token,
      timestamp: new Date(),
      options: tokenType === 'custom' || tokenType === 'password' ? { ...options } : undefined
    }));
    
    setTokenHistory(prev => [...newTokens, ...prev].slice(0, 50)); // Keep last 50
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const exportTokens = (format: 'json' | 'csv' | 'txt') => {
    const dataToExport = batchTokens.length > 0 ? batchTokens : [generatedToken];
    let content = '';
    let filename = '';
    let mimeType = '';
    
    switch (format) {
      case 'json':
        content = JSON.stringify({
          type: tokenType,
          generated: new Date().toISOString(),
          tokens: dataToExport,
          options: options
        }, null, 2);
        filename = `tokens-${Date.now()}.json`;
        mimeType = 'application/json';
        break;
      case 'csv':
        content = 'Type,Token,Generated\n' + 
                 dataToExport.map(token => `${tokenType},${token},${new Date().toISOString()}`).join('\n');
        filename = `tokens-${Date.now()}.csv`;
        mimeType = 'text/csv';
        break;
      case 'txt':
        content = dataToExport.join('\n');
        filename = `tokens-${Date.now()}.txt`;
        mimeType = 'text/plain';
        break;
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearHistory = () => {
    setTokenHistory([]);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          if (imported.options) {
            setOptions(imported.options);
          }
        } catch (error) {
          console.error('Failed to import settings:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  const exportSettings = () => {
    const settings = {
      version: '1.0',
      exported: new Date().toISOString(),
      options: options,
      tokenType: tokenType
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blackbox-settings-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-cyber-black text-white">
      <header className="bg-cyber-dark border-b border-cyber-blue py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-cyber-blue" />
              <h1 className="text-xl font-cyber text-cyber-blue">ADVANCED TOKEN GENERATOR</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="flex items-center text-cyber-green hover:text-cyber-blue transition-colors duration-300"
              >
                <Database className="w-4 h-4 mr-1" />
                <span className="font-cyber">HISTORY ({tokenHistory.length})</span>
              </button>
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
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Generator */}
            <div className="lg:col-span-2">
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
                      className={`p-4 border ${tokenType === 'password' ? 'border-cyber-purple bg-cyber-dark' : 'border-cyber-blue'} 
                        hover:border-cyber-purple transition-colors duration-300`}
                      onClick={() => setTokenType('password')}
                    >
                      <Lock className="w-6 h-6 mx-auto mb-2 text-cyber-blue" />
                      <span className="block text-center font-cyber text-sm">PASSWORD</span>
                    </button>
                    <button
                      className={`p-4 border ${tokenType === 'custom' ? 'border-cyber-purple bg-cyber-dark' : 'border-cyber-blue'} 
                        hover:border-cyber-purple transition-colors duration-300`}
                      onClick={() => setTokenType('custom')}
                    >
                      <Shield className="w-6 h-6 mx-auto mb-2 text-cyber-blue" />
                      <span className="block text-center font-cyber text-sm">CUSTOM</span>
                    </button>
                    <button
                      className={`p-4 border ${tokenType === 'jwt' ? 'border-cyber-purple bg-cyber-dark' : 'border-cyber-blue'} 
                        hover:border-cyber-purple transition-colors duration-300`}
                      onClick={() => setTokenType('jwt')}
                    >
                      <Globe className="w-6 h-6 mx-auto mb-2 text-cyber-blue" />
                      <span className="block text-center font-cyber text-sm">JWT</span>
                    </button>
                    <button
                      className={`p-4 border ${tokenType === 'hash' ? 'border-cyber-purple bg-cyber-dark' : 'border-cyber-blue'} 
                        hover:border-cyber-purple transition-colors duration-300`}
                      onClick={() => setTokenType('hash')}
                    >
                      <Zap className="w-6 h-6 mx-auto mb-2 text-cyber-blue" />
                      <span className="block text-center font-cyber text-sm">HASH</span>
                    </button>
                  </div>

                  {/* Advanced Options */}
                  {(tokenType === 'custom' || tokenType === 'password') && (
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-cyber text-cyber-blue">CONFIGURATION</h3>
                        <button
                          onClick={() => setShowAdvanced(!showAdvanced)}
                          className="text-cyber-yellow hover:text-cyber-blue transition-colors duration-300"
                        >
                          <Settings className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-cyber text-cyber-blue mb-2">LENGTH</label>
                          <input
                            type="number"
                            value={options.length}
                            onChange={(e) => setOptions({...options, length: parseInt(e.target.value)})}
                            className="cyber-input"
                            min="8"
                            max="256"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-cyber text-cyber-blue mb-2">BATCH COUNT</label>
                          <input
                            type="number"
                            value={batchCount}
                            onChange={(e) => setBatchCount(parseInt(e.target.value))}
                            className="cyber-input"
                            min="1"
                            max="100"
                          />
                        </div>
                      </div>

                      {showAdvanced && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
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
                            <div>
                              <label className="block text-sm font-cyber text-cyber-blue mb-2">SUFFIX</label>
                              <input
                                type="text"
                                value={options.suffix}
                                onChange={(e) => setOptions({...options, suffix: e.target.value})}
                                className="cyber-input"
                                placeholder="Optional suffix"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-cyber text-cyber-blue mb-2">SEGMENTS</label>
                              <input
                                type="number"
                                value={options.segments}
                                onChange={(e) => setOptions({...options, segments: parseInt(e.target.value)})}
                                className="cyber-input"
                                min="1"
                                max="10"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-cyber text-cyber-blue mb-2">SEPARATOR</label>
                              <input
                                type="text"
                                value={options.separator}
                                onChange={(e) => setOptions({...options, separator: e.target.value})}
                                className="cyber-input"
                                placeholder="e.g., -, _, :"
                              />
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={options.includeLowercase}
                                onChange={(e) => setOptions({...options, includeLowercase: e.target.checked})}
                                className="form-checkbox text-cyber-purple"
                              />
                              <span className="font-cyber text-sm">LOWERCASE</span>
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
                            <label className="flex items-center space-x-2 col-span-2">
                              <input
                                type="checkbox"
                                checked={options.excludeSimilar}
                                onChange={(e) => setOptions({...options, excludeSimilar: e.target.checked})}
                                className="form-checkbox text-cyber-purple"
                              />
                              <span className="font-cyber text-sm">EXCLUDE SIMILAR (0, O, 1, l, I)</span>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Batch Count for other types */}
                  {tokenType !== 'custom' && tokenType !== 'password' && (
                    <div className="mb-6">
                      <label className="block text-sm font-cyber text-cyber-blue mb-2">BATCH COUNT</label>
                      <input
                        type="number"
                        value={batchCount}
                        onChange={(e) => setBatchCount(parseInt(e.target.value))}
                        className="cyber-input w-32"
                        min="1"
                        max="100"
                      />
                    </div>
                  )}

                  <div className="flex justify-center mb-6">
                    <button
                      onClick={handleGenerate}
                      className="cyberpunk-button flex items-center"
                    >
                      <RefreshCw className="w-5 h-5 mr-2" />
                      GENERATE {batchCount > 1 ? `${batchCount} TOKENS` : 'TOKEN'}
                    </button>
                  </div>

                  {/* Single Token Output */}
                  {generatedToken && (
                    <div className="relative mb-4">
                      <div className="bg-cyber-black border border-cyber-green p-4 font-mono break-all">
                        {generatedToken}
                      </div>
                      <button
                        onClick={() => copyToClipboard(generatedToken)}
                        className="absolute top-2 right-2 text-cyber-blue hover:text-cyber-purple transition-colors duration-300"
                        title="Copy to clipboard"
                      >
                        <Copy className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Batch Tokens Output */}
                  {batchTokens.length > 0 && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-cyber text-cyber-blue">GENERATED TOKENS ({batchTokens.length})</span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => copyToClipboard(batchTokens.join('\n'))}
                            className="text-cyber-blue hover:text-cyber-purple transition-colors duration-300"
                            title="Copy all"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-cyber-black border border-cyber-green p-4 max-h-64 overflow-y-auto">
                        {batchTokens.map((token, index) => (
                          <div key={index} className="font-mono text-sm mb-1 flex justify-between items-center">
                            <span className="break-all">{token}</span>
                            <button
                              onClick={() => copyToClipboard(token)}
                              className="ml-2 text-cyber-blue hover:text-cyber-purple transition-colors duration-300"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Export Options */}
                  {(generatedToken || batchTokens.length > 0) && (
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={() => exportTokens('txt')}
                        className="cyberpunk-button flex items-center"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        TXT
                      </button>
                      <button
                        onClick={() => exportTokens('csv')}
                        className="cyberpunk-button flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        CSV
                      </button>
                      <button
                        onClick={() => exportTokens('json')}
                        className="cyberpunk-button flex items-center"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        JSON
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Settings */}
              <div className="cyberpunk-border rounded">
                <div className="bg-cyber-dark p-4">
                  <h3 className="text-lg font-cyber text-cyber-blue mb-4">SETTINGS</h3>
                  <div className="space-y-3">
                    <button
                      onClick={exportSettings}
                      className="w-full cyberpunk-button flex items-center justify-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      EXPORT SETTINGS
                    </button>
                    <div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={importSettings}
                        accept=".json"
                        className="hidden"
                      />
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full cyberpunk-button flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        IMPORT SETTINGS
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="cyberpunk-border rounded">
                <div className="bg-cyber-dark p-4">
                  <h3 className="text-lg font-cyber text-cyber-blue mb-4">SECURITY INFO</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ENTROPY SOURCE</span>
                      <span className="text-cyber-green">WEB CRYPTO API</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SECURITY LEVEL</span>
                      <span className="text-cyber-green">CRYPTOGRAPHIC</span>
                    </div>
                    <div className="flex justify-between">
                      <span>COMPLIANCE</span>
                      <span className="text-cyber-green">NIST SP 800-63B</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CLIENT-SIDE</span>
                      <span className="text-cyber-green">100% LOCAL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Token History */}
              {showHistory && (
                <div className="cyberpunk-border rounded">
                  <div className="bg-cyber-dark p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-cyber text-cyber-blue">HISTORY</h3>
                      <button
                        onClick={clearHistory}
                        className="text-cyber-red hover:text-cyber-purple transition-colors duration-300"
                      >
                        CLEAR
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {tokenHistory.map((token) => (
                        <div key={token.id} className="bg-cyber-black p-2 text-xs">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-cyber-yellow">{token.type}</span>
                            <span className="text-gray-500">
                              {token.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="font-mono break-all text-gray-300 mb-1">
                            {token.value.substring(0, 40)}...
                          </div>
                          <button
                            onClick={() => copyToClipboard(token.value)}
                            className="text-cyber-blue hover:text-cyber-purple transition-colors duration-300"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StealthMode;