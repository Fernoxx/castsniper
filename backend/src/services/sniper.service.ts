import type {
  SniperConfig,
  MonitoredUser,
  DetectedToken,
  BuyResult,
} from '../types/index.js';
import { NeynarService } from './neynar.service.js';
import { ZoraCreatorCoinService } from './zora-creator-coin.service.js';
import { isValidAddress } from '../utils/address.js';

export class SniperService {
  private neynar: NeynarService;
  private zora: ZoraCreatorCoinService;
  private config: SniperConfig;
  private monitoredUsers: Map<number, MonitoredUser> = new Map();
  private processedTokens: Set<string> = new Set(); // Track processed tokens to avoid duplicates

  constructor(config: SniperConfig) {
    this.config = config;
    this.neynar = new NeynarService(config.neynarApiKey);
    this.zora = new ZoraCreatorCoinService(config.baseRpcUrl, config.privateKey);
  }

  /**
   * Add a user to monitor
   */
  async addUser(
    usernameOrFid: string | number,
    buyAmountEth?: number,
    slippagePercent?: number
  ): Promise<MonitoredUser | null> {
    let user: { fid: number; username: string } | null = null;

    if (typeof usernameOrFid === 'string') {
      user = await this.neynar.searchUser(usernameOrFid);
    } else {
      user = await this.neynar.getUserByFid(usernameOrFid);
    }

    if (!user) {
      console.error(`User not found: ${usernameOrFid}`);
      return null;
    }

    const monitoredUser: MonitoredUser = {
      fid: user.fid,
      username: user.username,
      buyAmountEth: buyAmountEth ?? this.config.defaultBuyAmountEth,
      slippagePercent: slippagePercent,
      enabled: true,
    };

    this.monitoredUsers.set(user.fid, monitoredUser);
    const slippageInfo = slippagePercent ? ` (${slippagePercent}% slippage)` : '';
    console.log(`Added user to monitor: ${user.username} (FID: ${user.fid})${slippageInfo}`);
    return monitoredUser;
  }

  /**
   * Remove a user from monitoring
   */
  removeUser(fid: number): boolean {
    return this.monitoredUsers.delete(fid);
  }

  /**
   * Update buy amount for a user
   */
  updateUserBuyAmount(fid: number, amountEth: number): boolean {
    const user = this.monitoredUsers.get(fid);
    if (user) {
      user.buyAmountEth = amountEth;
      return true;
    }
    return false;
  }

  /**
   * Get all monitored users
   */
  getMonitoredUsers(): MonitoredUser[] {
    return Array.from(this.monitoredUsers.values());
  }

  /**
   * Check all monitored users for new CAs
   */
  async checkAllUsers(): Promise<DetectedToken[]> {
    const allDetected: DetectedToken[] = [];

    for (const user of this.monitoredUsers.values()) {
      if (!user.enabled) continue;

      try {
        const tokens = await this.neynar.checkForNewCAs(user);
        allDetected.push(...tokens);
      } catch (error) {
        console.error(`Error checking user ${user.fid}:`, error);
      }
    }

    return allDetected;
  }

  /**
   * Process detected tokens and buy if valid
   */
  async processDetectedToken(token: DetectedToken): Promise<BuyResult | null> {
    // Create unique key for this token detection
    const tokenKey = `${token.contractAddress}-${token.castHash}`;
    
    // Skip if already processed
    if (this.processedTokens.has(tokenKey)) {
      console.log(`Token ${token.contractAddress} already processed from cast ${token.castHash}`);
      return null;
    }

    // Validate address
    if (!isValidAddress(token.contractAddress)) {
      console.log(`Invalid address detected: ${token.contractAddress}`);
      return null;
    }

    // Get user config
    const user = this.monitoredUsers.get(token.userFid);
    if (!user || !user.enabled) {
      console.log(`User ${token.userFid} not monitored or disabled`);
      return null;
    }

    console.log(`\n🔍 Processing detected token: ${token.contractAddress}`);
    console.log(`   From user: ${user.username} (FID: ${user.fid})`);
    console.log(`   Cast hash: ${token.castHash}`);

    // Validate it's a valid ERC20 token (Zora Creator Coin or Clanker token)
    const coinInfo = await this.zora.validateCreatorCoin(token.contractAddress);
    if (!coinInfo.isValid) {
      console.log(`   ❌ Invalid token contract`);
      return null;
    }

    console.log(`   ✅ Valid token: ${coinInfo.name} (${coinInfo.symbol})`);

    // Check if it has buy function (required for Zora Creator Coins and Clanker tokens)
    const hasBuy = await this.zora.hasBuyFunction(token.contractAddress);
    if (!hasBuy) {
      console.log(`   ⚠️  Token may not support direct buy function - attempting buy anyway`);
      // Continue anyway, as buy function detection might not catch all patterns
    }

    // Detect taxes before buying
    const testAmount = BigInt(Math.floor(parseFloat(user.buyAmountEth.toString()) * 1e18));
    const taxCheck = await this.zora.detectTax(token.contractAddress, testAmount);
    if (taxCheck.hasTax && taxCheck.taxPercent) {
      console.log(`   ⚠️  WARNING: Token has ${taxCheck.taxPercent.toFixed(2)}% tax/fee`);
      console.log(`   ⚠️  Proceeding anyway...`);
    }

    // Buy the token
    const ethAmount = BigInt(
      Math.floor(parseFloat(user.buyAmountEth.toString()) * 1e18)
    );

    // Use user-specific slippage if set, otherwise use default
    const slippageToUse = user.slippagePercent ?? this.config.maxSlippagePercent;
    
    console.log(`   💰 Buying with ${user.buyAmountEth} ETH (${slippageToUse}% slippage)...`);
    const buyResult = await this.zora.buyToken(
      token.contractAddress,
      ethAmount,
      slippageToUse
    );

    // Mark as processed
    this.processedTokens.add(tokenKey);

    if (buyResult.success) {
      console.log(`   ✅ Success! TX: ${buyResult.txHash}`);
      console.log(`   📊 Tokens received: ${buyResult.tokenAmount}`);
    } else {
      console.log(`   ❌ Buy failed: ${buyResult.error}`);
    }

    return buyResult;
  }

  /**
   * Run one check cycle
   */
  async runCheckCycle(): Promise<void> {
    if (!this.config.enabled) {
      console.log('Sniper is disabled');
      return;
    }

    if (this.monitoredUsers.size === 0) {
      console.log('No users being monitored');
      return;
    }

    console.log(`\n🔎 Checking ${this.monitoredUsers.size} monitored user(s)...`);

    // Check all users for new CAs
    const detectedTokens = await this.checkAllUsers();

    if (detectedTokens.length === 0) {
      console.log('No new CAs detected');
      return;
    }

    console.log(`\n🎯 Found ${detectedTokens.length} new CA(s)!`);

    // Process each detected token
    for (const token of detectedTokens) {
      await this.processDetectedToken(token);
      // Small delay between buys to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  /**
   * Start continuous monitoring
   */
  startMonitoring(intervalSeconds: number = 30): () => void {
    console.log(`Starting continuous monitoring (checking every ${intervalSeconds}s)...`);

    const interval = setInterval(async () => {
      try {
        await this.runCheckCycle();
      } catch (error) {
        console.error('Error in monitoring cycle:', error);
      }
    }, intervalSeconds * 1000);

    // Run immediately
    this.runCheckCycle().catch(console.error);

    // Return stop function
    return () => {
      clearInterval(interval);
      console.log('Monitoring stopped');
    };
  }
}
