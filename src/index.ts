import dotenv from 'dotenv';
import { SniperService } from './services/sniper.service.js';
import type { SniperConfig } from './types/index.js';

// Load environment variables
dotenv.config();

async function main() {
  // Validate required environment variables
  const requiredEnvVars = [
    'NEYNAR_API_KEY',
    'PRIVATE_KEY',
    'WALLET_ADDRESS',
    'BASE_RPC_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      console.error('Please check your .env file');
      process.exit(1);
    }
  }

  // Build config
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

  console.log('🚀 Farcaster Creator Coin Sniper Bot');
  console.log('=====================================\n');
  console.log('Configuration:');
  console.log(`  Wallet: ${config.walletAddress}`);
  console.log(`  Default Buy Amount: ${config.defaultBuyAmountEth} ETH`);
  console.log(`  Max Slippage: ${config.maxSlippagePercent}%`);
  console.log(`  Base RPC: ${config.baseRpcUrl}`);
  console.log(`  Enabled: ${config.enabled}\n`);

  // Create sniper service
  const sniper = new SniperService(config);

  // Example: Add users to monitor
  // You can modify this to accept command line arguments or use a config file
  const usersToMonitor = process.env.MONITORED_USERS?.split(',') || [];

  if (usersToMonitor.length === 0) {
    console.log('⚠️  No users specified to monitor.');
    console.log('Set MONITORED_USERS environment variable (comma-separated usernames or FIDs)');
    console.log('Example: MONITORED_USERS=username1,username2,12345\n');
    
    // Interactive mode: prompt for user
    console.log('Enter a Farcaster username or FID to monitor (or press Enter to exit):');
    
    // For now, we'll use a simple example
    // In production, you'd want to use readline or a CLI framework
    console.log('\n💡 Tip: Set MONITORED_USERS in .env file for automatic monitoring\n');
    
    // Start monitoring anyway (users can be added via API or config later)
    const stopMonitoring = sniper.startMonitoring(30);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n\nShutting down...');
      stopMonitoring();
      process.exit(0);
    });
    
    return;
  }

  // Add users to monitor
  console.log(`Adding ${usersToMonitor.length} user(s) to monitor...\n`);
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

  console.log('\n');

  // Start monitoring
  const checkInterval = parseInt(process.env.CHECK_INTERVAL_SECONDS || '30');
  const stopMonitoring = sniper.startMonitoring(checkInterval);

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n\nShutting down...');
    stopMonitoring();
    process.exit(0);
  });

  // Keep process alive
  process.on('SIGTERM', () => {
    console.log('\n\nShutting down...');
    stopMonitoring();
    process.exit(0);
  });
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
