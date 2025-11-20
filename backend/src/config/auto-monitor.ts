/**
 * Auto-monitored addresses configuration
 * These addresses/users will be automatically added to monitoring on startup
 * with custom slippage settings
 */

export interface AutoMonitorConfig {
  identifier: string; // Farcaster username, FID, ENS name, or Ethereum address
  buyAmountEth: number;
  slippagePercent: number; // Custom slippage for this address
  description?: string;
}

export const AUTO_MONITOR_ADDRESSES: AutoMonitorConfig[] = [
  {
    identifier: 'jessepollak', // Farcaster username from zora.co/@jessepollak
    buyAmountEth: 0.01, // Default amount, can be adjusted
    slippagePercent: 15, // 15% slippage as requested
    description: 'Jesse Pollak - Zora Creator Coin sniper target',
  },
  // Note: Ethereum addresses and ENS names can be added here
  // For now, monitoring by Farcaster username is the primary method
  // When jessepollak casts a contract address, it will be detected and bought with 15% slippage
];

// Note: ENS names like jesse.base.eth will be resolved to addresses
// and can be monitored by watching for contract addresses in casts
