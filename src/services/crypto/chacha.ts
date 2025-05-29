import { CryptoResult } from '../../types/crypto';

// ChaCha20 constants
const SIGMA = new Uint8Array([
  0x65, 0x78, 0x70, 0x61, // "expa"
  0x6e, 0x64, 0x20, 0x33, // "nd 3"
  0x32, 0x2d, 0x62, 0x79, // "2-by"
  0x74, 0x65, 0x20, 0x6b  // "te k"
]);

// Convert string to Uint8Array
const str2ab = (str: string): Uint8Array => {
  const encoder = new TextEncoder();
  return encoder.encode(str);
};

// Convert Uint8Array to string
const ab2str = (buf: Uint8Array): string => {
  const decoder = new TextDecoder();
  return decoder.decode(buf);
};

// 32-bit rotation
const rotl = (a: number, b: number): number => {
  return (a << b) | (a >>> (32 - b));
};

// Quarter round function
const quarterRound = (state: Uint32Array, a: number, b: number, c: number, d: number): void => {
  state[a] += state[b]; state[d] ^= state[a]; state[d] = rotl(state[d], 16);
  state[c] += state[d]; state[b] ^= state[c]; state[b] = rotl(state[b], 12);
  state[a] += state[b]; state[d] ^= state[a]; state[d] = rotl(state[d], 8);
  state[c] += state[d]; state[b] ^= state[c]; state[b] = rotl(state[b], 7);
};

// ChaCha20 block function
const chacha20Block = (key: Uint8Array, counter: number, nonce: Uint8Array): Uint8Array => {
  const state = new Uint32Array(16);
  
  // Initialize state with constants
  state[0] = (SIGMA[0] | (SIGMA[1] << 8) | (SIGMA[2] << 16) | (SIGMA[3] << 24));
  state[1] = (SIGMA[4] | (SIGMA[5] << 8) | (SIGMA[6] << 16) | (SIGMA[7] << 24));
  state[2] = (SIGMA[8] | (SIGMA[9] << 8) | (SIGMA[10] << 16) | (SIGMA[11] << 24));
  state[3] = (SIGMA[12] | (SIGMA[13] << 8) | (SIGMA[14] << 16) | (SIGMA[15] << 24));
  
  // Add key to state
  for (let i = 0; i < 8; i++) {
    state[4 + i] = (
      key[i * 4] |
      (key[i * 4 + 1] << 8) |
      (key[i * 4 + 2] << 16) |
      (key[i * 4 + 3] << 24)
    );
  }
  
  // Add counter and nonce
  state[12] = counter;
  state[13] = (nonce[0] | (nonce[1] << 8) | (nonce[2] << 16) | (nonce[3] << 24));
  state[14] = (nonce[4] | (nonce[5] << 8) | (nonce[6] << 16) | (nonce[7] << 24));
  state[15] = (nonce[8] | (nonce[9] << 8) | (nonce[10] << 16) | (nonce[11] << 24));
  
  // Copy initial state
  const initialState = state.slice();
  
  // Perform 20 rounds (10 double rounds)
  for (let i = 0; i < 10; i++) {
    // Column rounds
    quarterRound(state, 0, 4, 8, 12);
    quarterRound(state, 1, 5, 9, 13);
    quarterRound(state, 2, 6, 10, 14);
    quarterRound(state, 3, 7, 11, 15);
    
    // Diagonal rounds
    quarterRound(state, 0, 5, 10, 15);
    quarterRound(state, 1, 6, 11, 12);
    quarterRound(state, 2, 7, 8, 13);
    quarterRound(state, 3, 4, 9, 14);
  }
  
  // Add initial state
  for (let i = 0; i < 16; i++) {
    state[i] += initialState[i];
  }
  
  // Convert to bytes
  const output = new Uint8Array(64);
  for (let i = 0; i < 16; i++) {
    output[i * 4] = state[i] & 0xff;
    output[i * 4 + 1] = (state[i] >>> 8) & 0xff;
    output[i * 4 + 2] = (state[i] >>> 16) & 0xff;
    output[i * 4 + 3] = (state[i] >>> 24) & 0xff;
  }
  
  return output;
};

// Derive key using PBKDF2
const deriveKey = async (password: string, salt: Uint8Array): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Import password as raw key
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive a key using PBKDF2
  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt']
  );
  
  // Export the key as raw bytes
  const keyBuffer = await crypto.subtle.exportKey('raw', derivedKey);
  return new Uint8Array(keyBuffer);
};

// ChaCha20 encryption/decryption
const chacha20Process = (data: Uint8Array, key: Uint8Array, nonce: Uint8Array): Uint8Array => {
  const output = new Uint8Array(data.length);
  let counter = 1;
  
  for (let i = 0; i < data.length; i += 64) {
    const keyStream = chacha20Block(key, counter++, nonce);
    const chunk = Math.min(64, data.length - i);
    
    for (let j = 0; j < chunk; j++) {
      output[i + j] = data[i + j] ^ keyStream[j];
    }
  }
  
  return output;
};

export const encrypt = async (text: string, password: string): Promise<CryptoResult> => {
  try {
    // Generate salt and nonce
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const nonce = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive key from password
    const key = await deriveKey(password, salt);
    
    // Convert input to bytes and encrypt
    const data = str2ab(text);
    const encrypted = chacha20Process(data, key, nonce);
    
    // Combine salt, nonce, and encrypted data
    const result = new Uint8Array(salt.length + nonce.length + encrypted.length);
    result.set(salt, 0);
    result.set(nonce, salt.length);
    result.set(encrypted, salt.length + nonce.length);
    
    // Convert to base64
    return {
      success: true,
      result: btoa(String.fromCharCode(...result))
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Encryption failed'
    };
  }
};

export const decrypt = async (encryptedText: string, password: string): Promise<CryptoResult> => {
  try {
    // Decode base64
    const encryptedData = new Uint8Array(
      atob(encryptedText).split('').map(c => c.charCodeAt(0))
    );
    
    // Extract salt, nonce, and encrypted data
    const salt = encryptedData.slice(0, 16);
    const nonce = encryptedData.slice(16, 28);
    const data = encryptedData.slice(28);
    
    // Derive key
    const key = await deriveKey(password, salt);
    
    // Decrypt
    const decrypted = chacha20Process(data, key, nonce);
    
    return {
      success: true,
      result: ab2str(decrypted)
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Decryption failed'
    };
  }
};