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

export interface ContractMonitorConfig {
  address: string; // Ethereum address to monitor for contract creations
  buyAmountEth: number;
  slippagePercent: number;
  description?: string;
}

export const AUTO_MONITOR_ADDRESSES: AutoMonitorConfig[] = [
  {
    identifier: 'jessepollak', // Farcaster username from zora.co/@jessepollak
    buyAmountEth: 0.01, // Default amount, can be adjusted
    slippagePercent: 15, // 15% slippage as requested
    description: 'Jesse Pollak - Zora Creator Coin sniper target (cast monitoring)',
  },
];

/**
 * Contract creation monitoring configuration
 * Monitors for new contract creations from these addresses
 * When a Zora Creator Coin is created/activated, automatically buys it
 */
export const CONTRACT_MONITOR_ADDRESSES: ContractMonitorConfig[] = [
  {
    address: '0xd211b9417f28d128435cd8d022aeaebbc8a28f17', // Jesse's address
    buyAmountEth: 0.035, // 0.035 ETH (equivalent to ~100 USDC at current rates)
    slippagePercent: 15, // 15% slippage
    description: 'Jesse Pollak wallet - Monitor for Zora Creator Coin contract creations. Will buy with 0.035 ETH or 100 USDC.',
  },
];
