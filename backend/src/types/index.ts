export interface SniperConfig {
  neynarApiKey: string;
  privateKey: string;
  walletAddress: string;
  baseRpcUrl: string;
  defaultBuyAmountEth: number;
  maxSlippagePercent: number;
  gasPriceGwei: number;
  enabled: boolean;
}

export interface MonitoredUser {
  fid: number;
  username?: string;
  buyAmountEth: number;
  slippagePercent?: number; // Custom slippage for this user (overrides default)
  enabled: boolean;
}

export interface DetectedToken {
  contractAddress: string;
  castHash: string;
  userFid: number;
  timestamp: number;
}

export interface BuyResult {
  success: boolean;
  txHash?: string;
  error?: string;
  tokenAmount?: string;
  ethSpent?: string;
}

export interface ZoraCreatorCoinInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  isValid: boolean;
}
