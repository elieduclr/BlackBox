import { CryptoResult } from '../../types/crypto';

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

// Generate a random salt
const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

// Derive an AES key from a password using PBKDF2
const deriveKey = async (password: string, salt: Uint8Array): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const passwordData = encoder.encode(password);
  
  // Import password as raw key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    passwordData,
    'PBKDF2',
    false,
    ['deriveKey']
  );
  
  // Derive the AES-GCM key using PBKDF2
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    {
      name: 'AES-GCM',
      length: 256
    },
    false,
    ['encrypt', 'decrypt']
  );
};

export const encrypt = async (text: string, password: string): Promise<CryptoResult> => {
  try {
    // Generate salt and IV
    const salt = generateSalt();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Derive encryption key
    const key = await deriveKey(password, salt);
    
    // Encrypt the data
    const data = str2ab(text);
    const encrypted = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    // Combine salt, IV, and encrypted data
    const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
    result.set(salt, 0);
    result.set(iv, salt.length);
    result.set(new Uint8Array(encrypted), salt.length + iv.length);
    
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
    
    // Extract salt, IV, and encrypted data
    const salt = encryptedData.slice(0, 16);
    const iv = encryptedData.slice(16, 28);
    const data = encryptedData.slice(28);
    
    // Derive key
    const key = await deriveKey(password, salt);
    
    // Decrypt
    const decrypted = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );
    
    return {
      success: true,
      result: ab2str(new Uint8Array(decrypted))
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Decryption failed'
    };
  }
};