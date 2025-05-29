import { Algorithm, CryptoResult } from '../../types/crypto';
import * as aes from './aes';
import * as chacha from './chacha';
import * as kyber from './kyber_sim';
import * as custom from './custom_algo';

export const encrypt = async (
  text: string,
  password: string,
  algorithm: Algorithm
): Promise<CryptoResult> => {
  switch (algorithm) {
    case 'aes':
      return aes.encrypt(text, password);
    case 'chacha':
      return chacha.encrypt(text, password);
    case 'kyber':
      return kyber.encrypt(text, password);
    case 'custom':
      return custom.encrypt(text, password);
    default:
      return {
        success: false,
        error: 'Unknown algorithm'
      };
  }
};

export const decrypt = async (
  encryptedText: string,
  password: string,
  algorithm: Algorithm
): Promise<CryptoResult> => {
  switch (algorithm) {
    case 'aes':
      return aes.decrypt(encryptedText, password);
    case 'chacha':
      return chacha.decrypt(encryptedText, password);
    case 'kyber':
      return kyber.decrypt(encryptedText, password);
    case 'custom':
      return custom.decrypt(encryptedText, password);
    default:
      return {
        success: false,
        error: 'Unknown algorithm'
      };
  }
};