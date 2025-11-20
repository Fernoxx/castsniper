import './api/index.js';

// Initialize and start monitoring if enabled
import dotenv from 'dotenv';
import { SniperService } from './services/sniper.service.js';
import type { SniperConfig } from './types/index.js';

dotenv.config();

async function startBackgroundMonitoring() {
  const requiredEnvVars = [
    'NEYNAR_API_KEY',
    'PRIVATE_KEY',
    'WALLET_ADDRESS',
    'BASE_RPC_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`⚠️  Missing environment variable: ${envVar}. Background monitoring disabled.`);
      return;
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

  if (!config.enabled) {
    console.log('⏸️  Sniper is disabled. Set SNIPER_ENABLED=true to enable.');
    return;
  }

  const sniper = new SniperService(config);

  // Add users from environment variable
  const usersToMonitor = process.env.MONITORED_USERS?.split(',') || [];
  
  if (usersToMonitor.length > 0) {
    console.log(`\n📋 Adding ${usersToMonitor.length} user(s) to monitor...\n`);
    for (const userInput of usersToMonitor) {
      const trimmed = userInput.trim();
      if (!trimmed) continue;

      const isFid = /^\d+$/.test(trimmed);
      const identifier = isFid ? parseInt(trimmed) : trimmed;
      
      const user = await sniper.addUser(identifier);
      if (user) {
        console.log(`✅ Monitoring: ${user.username} (FID: ${user.fid})`);
      }
    }
  }

  // Start background monitoring
  const checkInterval = parseInt(process.env.CHECK_INTERVAL_SECONDS || '30');
  console.log(`\n🔄 Starting background monitoring (checking every ${checkInterval}s)...\n`);
  sniper.startMonitoring(checkInterval);
}

// Start background monitoring if enabled
if (process.env.ENABLE_BACKGROUND_MONITORING !== 'false') {
  startBackgroundMonitoring().catch(console.error);
}
