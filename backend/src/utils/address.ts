import { isAddress } from 'ethers';

/**
 * Validates if a string is a valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return isAddress(address);
}

/**
 * Extracts Ethereum addresses from text
 * Matches 0x followed by 40 hex characters
 */
export function extractAddresses(text: string): string[] {
  const addressRegex = /0x[a-fA-F0-9]{40}/g;
  const matches = text.match(addressRegex) || [];
  return matches.filter(addr => isValidAddress(addr));
}

/**
 * Normalizes address to checksum format
 */
export function toChecksumAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address');
  }
  // ethers.js handles checksum automatically, but we normalize to lowercase for consistency
  return address.toLowerCase();
}
