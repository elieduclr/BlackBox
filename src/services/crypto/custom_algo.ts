import { CryptoResult } from '../../types/crypto';
import * as aes from './aes';
import * as chacha from './chacha';

// The custom algorithm uses a layered approach:
// 1. First layer: ChaCha20 encryption with derived key 1
// 2. Second layer: AES-256-GCM encryption with derived key 2
// 3. Additional obfuscation with key stretching and data transformation
// 4. Enhanced security with proper key derivation, salts, and integrity checks

// Browser-compatible key derivation using Web Crypto API
const deriveMultipleKeys = async (password: string, salt1: Uint8Array, salt2: Uint8Array): Promise<{ key1: string; key2: string }> => {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );
  
  // Derive first key using PBKDF2
  const derivedKey1Bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt1,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );
  
  // Derive second key using PBKDF2
  const derivedKey2Bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt2,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );
  
  // Convert to hex strings for compatibility with existing AES/ChaCha implementations
  const key1 = Array.from(new Uint8Array(derivedKey1Bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  const key2 = Array.from(new Uint8Array(derivedKey2Bits))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
  
  return { key1, key2 };
};

// Enhanced obfuscation function with variable patterns
const obfuscate = (text: string, seed: Uint8Array): string => {
  // Use seed to create pseudo-random obfuscation pattern
  const seedValue = new DataView(seed.buffer).getUint32(0, false);
  let result = '';
  const patterns = ['§', '¢', '€', '£', '¥', '₹', '₿'];
  
  for (let i = 0; i < text.length; i++) {
    result += text[i];
    // Variable obfuscation pattern based on seed and position
    const patternIndex = (seedValue + i) % patterns.length;
    const frequency = 3 + (seedValue % 5); // Frequency between 3-7
    if (i % frequency === (frequency - 1)) {
      result += patterns[patternIndex];
    }
  }
  return result;
};

// Enhanced deobfuscation function
const deobfuscate = (text: string): string => {
  // Remove all possible obfuscation characters
  return text.replace(/[§¢€£¥₹₿]/g, '');
};

// Generate integrity hash using Web Crypto API
const generateIntegrityHash = async (data: string, key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(key);
  const dataBuffer = encoder.encode(data);
  
  // Import key for HMAC
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Generate HMAC
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBuffer);
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Verify integrity hash using constant-time comparison
const verifyIntegrityHash = async (data: string, key: string, expectedHash: string): Promise<boolean> => {
  const actualHash = await generateIntegrityHash(data, key);
  
  // Constant-time comparison to prevent timing attacks
  if (actualHash.length !== expectedHash.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < actualHash.length; i++) {
    result |= actualHash.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  
  return result === 0;
};

// Generate random bytes using Web Crypto API
const generateRandomBytes = (length: number): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(length));
};

// Convert Uint8Array to hex string
const uint8ArrayToHex = (array: Uint8Array): string => {
  return Array.from(array)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Convert hex string to Uint8Array
const hexToUint8Array = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

export const encrypt = async (text: string, password: string): Promise<CryptoResult> => {
  try {
    // 1. Generate random salts for key derivation
    const salt1 = generateRandomBytes(32);
    const salt2 = generateRandomBytes(32);
    const obfuscationSeed = generateRandomBytes(4);
    
    // 2. Derive multiple keys with proper salts
    const { key1, key2 } = await deriveMultipleKeys(password, salt1, salt2);
    
    // 3. Generate integrity key for verification
    const encoder = new TextEncoder();
    const integrityKeyBuffer = encoder.encode(password + 'INTEGRITY');
    const integrityHashBuffer = await crypto.subtle.digest('SHA-256', integrityKeyBuffer);
    const integrityKey = uint8ArrayToHex(new Uint8Array(integrityHashBuffer));
    
    // 4. Apply first layer of encryption (ChaCha20)
    const firstLayerResult = await chacha.encrypt(text, key1);
    if (!firstLayerResult.success || !firstLayerResult.result) {
      throw new Error('First layer encryption failed');
    }
    
    // 5. Generate integrity hash of first layer
    const integrityHash = await generateIntegrityHash(firstLayerResult.result, integrityKey);
    
    // 6. Apply custom obfuscation with seed
    const obfuscated = obfuscate(firstLayerResult.result, obfuscationSeed);
    
    // 7. Apply second layer of encryption (AES-256-GCM)
    const secondLayerResult = await aes.encrypt(obfuscated, key2);
    if (!secondLayerResult.success || !secondLayerResult.result) {
      throw new Error('Second layer encryption failed');
    }
    
    // 8. Combine salts, seed, integrity hash, and encrypted data
    const saltedResult = uint8ArrayToHex(salt1) + '|' + 
                        uint8ArrayToHex(salt2) + '|' + 
                        uint8ArrayToHex(obfuscationSeed) + '|' + 
                        integrityHash + '|' + 
                        secondLayerResult.result;
    
    return {
      success: true,
      result: saltedResult
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during encryption'
    };
  }
};

export const decrypt = async (encryptedText: string, password: string): Promise<CryptoResult> => {
  try {
    // 1. Parse salts, seed, integrity hash, and encrypted data
    const parts = encryptedText.split('|');
    if (parts.length !== 5) {
      throw new Error('Invalid encrypted data format');
    }
    
    const salt1 = hexToUint8Array(parts[0]);
    const salt2 = hexToUint8Array(parts[1]);
    const obfuscationSeed = hexToUint8Array(parts[2]);
    const expectedIntegrityHash = parts[3];
    const actualEncryptedData = parts[4];
    
    // 2. Derive multiple keys with the same salts
    const { key1, key2 } = await deriveMultipleKeys(password, salt1, salt2);
    
    // 3. Generate integrity key for verification
    const encoder = new TextEncoder();
    const integrityKeyBuffer = encoder.encode(password + 'INTEGRITY');
    const integrityHashBuffer = await crypto.subtle.digest('SHA-256', integrityKeyBuffer);
    const integrityKey = uint8ArrayToHex(new Uint8Array(integrityHashBuffer));
    
    // 4. Decrypt outer layer (AES-256-GCM)
    const outerDecryptResult = await aes.decrypt(actualEncryptedData, key2);
    if (!outerDecryptResult.success || !outerDecryptResult.result) {
      throw new Error('Outer layer decryption failed');
    }
    
    // 5. Deobfuscate
    const deobfuscated = deobfuscate(outerDecryptResult.result);
    
    // 6. Verify integrity before final decryption
    const integrityValid = await verifyIntegrityHash(deobfuscated, integrityKey, expectedIntegrityHash);
    if (!integrityValid) {
      throw new Error('Data integrity verification failed - possible tampering detected');
    }
    
    // 7. Decrypt inner layer (ChaCha20)
    const innerDecryptResult = await chacha.decrypt(deobfuscated, key1);
    if (!innerDecryptResult.success || !innerDecryptResult.result) {
      throw new Error('Inner layer decryption failed');
    }
    
    return {
      success: true,
      result: innerDecryptResult.result
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error during decryption'
    };
  }
};