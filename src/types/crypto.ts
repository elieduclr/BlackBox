export type Algorithm = 'aes' | 'chacha' | 'kyber' | 'custom';

export interface CryptoResult {
  success: boolean;
  result?: string;
  error?: string;
}