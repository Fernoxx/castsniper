import { SniperService } from './sniper.service.js';
import type { SniperConfig } from '../types/index.js';
import { AUTO_MONITOR_ADDRESSES } from '../config/auto-monitor.js';
import dotenv from 'dotenv';

dotenv.config();

let sniperServiceInstance: SniperService | null = null;
let monitoringStopFunction: (() => void) | null = null;

/**
 * Get or create the shared SniperService instance
 */
export function getSniperService(): SniperService {
  if (sniperServiceInstance) {
    return sniperServiceInstance;
  }

  const requiredEnvVars = [
    'NEYNAR_API_KEY',
    'PRIVATE_KEY',
    'WALLET_ADDRESS',
    'BASE_RPC_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  const config: SniperConfig = {
    neynarApiKey: process.env.NEYNAR_API_KEY!,
    privateKey: process.env.PRIVATE_KEY!,
    walletAddress: process.env.WALLET_ADDRESS!,
    baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    defaultBuyAmountEth: parseFloat(process.env.DEFAULT_BUY_AMOUNT_ETH || '0.01'),
    maxSlippagePercent: parseFloat(process.env.MAX_SLIPPAGE_PERCENT || '5'),
    gasPriceGwei: parseFloat(process.env.GAS_PRICE_GWEI || '0.1'),
    enabled: process.env.SNIPER_ENABLED !== 'false',
  };

  sniperServiceInstance = new SniperService(config);
  return sniperServiceInstance;
}

/**
 * Initialize auto-monitored addresses
 */
async function initializeAutoMonitoredUsers(): Promise<void> {
  if (AUTO_MONITOR_ADDRESSES.length === 0) {
    return;
  }

  const sniper = getSniperService();
  
  console.log(`\n📋 Initializing ${AUTO_MONITOR_ADDRESSES.length} auto-monitored user(s)...\n`);
  
  for (const config of AUTO_MONITOR_ADDRESSES) {
    try {
      const user = await sniper.addUser(
        config.identifier,
        config.buyAmountEth,
        config.slippagePercent
      );
      
      if (user) {
        console.log(`✅ Auto-monitoring: ${user.username || config.identifier} (FID: ${user.fid})`);
        if (config.description) {
          console.log(`   ${config.description}`);
        }
      } else {
        console.warn(`⚠️  Could not add auto-monitor user: ${config.identifier}`);
      }
    } catch (error) {
      console.error(`❌ Error adding auto-monitor user ${config.identifier}:`, error);
    }
  }
  
  console.log('');
}

/**
 * Start background monitoring if not already started
 */
export async function startBackgroundMonitoring(): Promise<void> {
  if (monitoringStopFunction) {
    console.log('Background monitoring already running');
    return;
  }

  const sniper = getSniperService();
  
  if (!sniper['config'].enabled) {
    console.log('⏸️  Sniper is disabled. Set SNIPER_ENABLED=true to enable.');
    return;
  }

  // Initialize auto-monitored users first
  await initializeAutoMonitoredUsers();

  const checkInterval = parseInt(process.env.CHECK_INTERVAL_SECONDS || '30');
  console.log(`🔄 Starting background monitoring (checking every ${checkInterval}s)...`);
  console.log(`📋 Monitoring users added via web interface and auto-monitored addresses\n`);
  
  monitoringStopFunction = sniper.startMonitoring(checkInterval);
}

/**
 * Stop background monitoring
 */
export function stopBackgroundMonitoring(): void {
  if (monitoringStopFunction) {
    monitoringStopFunction();
    monitoringStopFunction = null;
    console.log('Background monitoring stopped');
  }
}
