import { ethers } from 'ethers';
import { ZoraCreatorCoinService } from './zora-creator-coin.service.js';
import type { BuyResult } from '../types/index.js';

// USDC on Base: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const USDC_ABI = [
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
];

export class ContractMonitorService {
  private provider: ethers.JsonRpcProvider;
  private zora: ZoraCreatorCoinService;
  private monitoredAddress: string;
  private processedContracts: Set<string> = new Set();
  private buyAmountEth: number;
  private slippagePercent: number;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(
    rpcUrl: string,
    zoraService: ZoraCreatorCoinService,
    monitoredAddress: string,
    buyAmountEth: number,
    slippagePercent: number
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.zora = zoraService;
    this.monitoredAddress = monitoredAddress.toLowerCase();
    this.buyAmountEth = buyAmountEth;
    this.slippagePercent = slippagePercent;
  }

  /**
   * Check wallet balance for ETH and USDC
   */
  async getWalletBalances(walletAddress: string): Promise<{ eth: bigint; usdc: bigint }> {
    const ethBalance = await this.provider.getBalance(walletAddress);
    
    let usdcBalance = BigInt(0);
    try {
      const usdcContract = new ethers.Contract(USDC_ADDRESS, USDC_ABI, this.provider);
      usdcBalance = await usdcContract.balanceOf(walletAddress);
    } catch (error) {
      console.warn('Could not fetch USDC balance:', error);
    }

    return { eth: ethBalance, usdc: usdcBalance };
  }

  /**
   * Buy token with USDC (if token supports it)
   * Note: Most Zora Creator Coins only accept ETH, but we'll try USDC if ETH fails
   */
  async buyWithUSDC(
    tokenAddress: string,
    usdcAmount: bigint,
    slippagePercent: number
  ): Promise<BuyResult> {
    // Most Zora Creator Coins only accept ETH via buy() function
    // USDC buying would require a DEX swap first, which is more complex
    // For now, return failure and fall back to ETH
    return {
      success: false,
      error: 'USDC direct buy not supported - Zora Creator Coins typically only accept ETH',
    };
  }

  /**
   * Buy token with ETH, fallback to USDC if ETH fails
   */
  async buyTokenWithFallback(
    tokenAddress: string,
    ethAmount: bigint,
    slippagePercent: number,
    walletAddress: string
  ): Promise<BuyResult> {
    // Try ETH first
    console.log(`\n💰 Attempting to buy ${tokenAddress} with ETH...`);
    const ethResult = await this.zora.buyToken(tokenAddress, ethAmount, slippagePercent);

    if (ethResult.success) {
      return ethResult;
    }

    console.log(`⚠️  ETH buy failed: ${ethResult.error}`);
    console.log(`💵 Attempting alternative payment method...`);

    // Check if we have USDC
    const balances = await this.getWalletBalances(walletAddress);
    const usdcDecimals = 6; // USDC has 6 decimals
    const ethInUsdc = (ethAmount * BigInt(10 ** usdcDecimals)) / BigInt(10 ** 18);

    if (balances.usdc >= ethInUsdc) {
      console.log(`💵 Trying USDC purchase...`);
      // For now, USDC direct buy isn't supported by Zora Creator Coins
      // Would need to swap USDC -> ETH first, which adds complexity
      return {
        success: false,
        error: 'ETH purchase failed and USDC direct buy not supported by Zora Creator Coins',
      };
    }

    return {
      success: false,
      error: `ETH buy failed and insufficient USDC balance. ETH error: ${ethResult.error}`,
    };
  }

  /**
   * Monitor for new contract creations from the monitored address
   */
  async checkForNewContracts(): Promise<void> {
    try {
      // Get latest block
      const latestBlock = await this.provider.getBlockNumber();
      const fromBlock = Math.max(latestBlock - 100, 0); // Check last 100 blocks

      console.log(`\n🔍 Checking for new contracts created by ${this.monitoredAddress}...`);
      console.log(`   Scanning blocks ${fromBlock} to ${latestBlock}`);

      // Get all transactions from the monitored address
      const filter = {
        fromBlock,
        toBlock: latestBlock,
        from: this.monitoredAddress,
      };

      const logs = await this.provider.getLogs({
        ...filter,
        topics: [
          // Contract creation event (ContractCreated or similar)
          // Also check for Transfer events from null address (token creation)
          ethers.id('Transfer(address,address,uint256)'),
        ],
      });

      // Also check transaction receipts for contract creations and activations
      for (let blockNum = fromBlock; blockNum <= latestBlock; blockNum++) {
        try {
          const block = await this.provider.getBlock(blockNum, true);
          if (!block || !block.transactions) continue;

          for (const txHash of block.transactions) {
            if (typeof txHash !== 'string') continue;

            try {
              const receipt = await this.provider.getTransactionReceipt(txHash);
              if (!receipt) continue;

              const tx = await this.provider.getTransaction(txHash);
              if (!tx) continue;

              // Check if transaction is from monitored address
              const isFromMonitoredAddress = tx.from?.toLowerCase() === this.monitoredAddress;

              // Case 1: Contract creation (to is null and contractAddress exists)
              if (isFromMonitoredAddress && !receipt.to && receipt.contractAddress) {
                const contractAddress = receipt.contractAddress.toLowerCase();

                // Skip if already processed
                if (this.processedContracts.has(contractAddress)) {
                  continue;
                }

                console.log(`\n🎯 Found new contract creation: ${contractAddress}`);
                console.log(`   From: ${this.monitoredAddress}`);
                console.log(`   TX: ${txHash}`);

                // Validate if it's a Zora Creator Coin
                const coinInfo = await this.zora.validateCreatorCoin(contractAddress);
                if (!coinInfo.isValid) {
                  console.log(`   ❌ Not a valid Zora Creator Coin`);
                  this.processedContracts.add(contractAddress);
                  continue;
                }

                console.log(`   ✅ Valid Zora Creator Coin: ${coinInfo.name} (${coinInfo.symbol})`);

                // Check if it has buy function
                const hasBuy = await this.zora.hasBuyFunction(contractAddress);
                if (!hasBuy) {
                  console.log(`   ⚠️  May not support buy function, attempting anyway...`);
                }

                // Get wallet address and check balances
                const walletAddress = await this.zora.getWalletAddress();
                const balances = await this.getWalletBalances(walletAddress);
                
                // Target: 0.035 ETH or 100 USDC equivalent
                const targetEth = BigInt(Math.floor(this.buyAmountEth * 1e18)); // 0.035 ETH
                const targetUsdc = BigInt(100 * 1e6); // 100 USDC (6 decimals)
                
                // Check if we have enough ETH
                let ethAmount = BigInt(0);
                if (balances.eth >= targetEth) {
                  ethAmount = targetEth;
                  console.log(`   💰 Wallet balance: ${ethers.formatEther(balances.eth)} ETH`);
                  console.log(`   💰 Using: ${ethers.formatEther(ethAmount)} ETH (target: 0.035 ETH)`);
                } else if (balances.usdc >= targetUsdc) {
                  // If not enough ETH, check USDC and swap if needed
                  console.log(`   💰 ETH balance insufficient: ${ethers.formatEther(balances.eth)} ETH`);
                  console.log(`   💵 USDC balance: ${(Number(balances.usdc) / 1e6).toFixed(2)} USDC`);
                  console.log(`   💵 Target: 100 USDC`);
                  
                  // For now, try with available ETH (will attempt USDC swap in buyTokenWithFallback)
                  ethAmount = balances.eth > BigInt(0) ? balances.eth : BigInt(0);
                  console.log(`   ⚠️  Will attempt purchase with available ETH: ${ethers.formatEther(ethAmount)} ETH`);
                } else {
                  console.log(`   ⚠️  Insufficient funds: ${ethers.formatEther(balances.eth)} ETH, ${(Number(balances.usdc) / 1e6).toFixed(2)} USDC`);
                  console.log(`   ⚠️  Need: 0.035 ETH or 100 USDC`);
                  this.processedContracts.add(contractAddress);
                  continue;
                }

                // Try to buy with ETH/USDC fallback
                const buyResult = await this.buyTokenWithFallback(
                  contractAddress,
                  ethAmount,
                  this.slippagePercent,
                  walletAddress
                );

                // Mark as processed
                this.processedContracts.add(contractAddress);

                if (buyResult.success) {
                  console.log(`   ✅ Successfully purchased! TX: ${buyResult.txHash}`);
                  console.log(`   📊 Tokens received: ${buyResult.tokenAmount}`);
                } else {
                  console.log(`   ❌ Purchase failed: ${buyResult.error}`);
                }
              }

              // Case 2: Contract activation - buy() call from monitored address
              // Check if transaction calls buy() function (method ID: 0x3593564c or 0x6945b123)
              if (isFromMonitoredAddress && receipt.to && tx.data) {
                const buyMethodIds = [
                  '0x3593564c', // buy()
                  '0x6945b123', // buy(uint256)
                  '0x02751cec', // buy(uint256,address)
                ];

                const isBuyCall = buyMethodIds.some(methodId => 
                  tx.data.toLowerCase().startsWith(methodId.toLowerCase())
                );

                if (isBuyCall) {
                  const contractAddress = receipt.to.toLowerCase();

                  // Skip if already processed
                  if (this.processedContracts.has(contractAddress)) {
                    continue;
                  }

                  console.log(`\n🎯 Found contract activation (buy call): ${contractAddress}`);
                  console.log(`   From: ${this.monitoredAddress}`);
                  console.log(`   TX: ${txHash}`);

                  // Validate if it's a Zora Creator Coin
                  const coinInfo = await this.zora.validateCreatorCoin(contractAddress);
                  if (!coinInfo.isValid) {
                    console.log(`   ❌ Not a valid Zora Creator Coin`);
                    this.processedContracts.add(contractAddress);
                    continue;
                  }

                  console.log(`   ✅ Valid Zora Creator Coin: ${coinInfo.name} (${coinInfo.symbol})`);

                  // Get wallet address and check balances
                  const walletAddress = await this.zora.getWalletAddress();
                  const balances = await this.getWalletBalances(walletAddress);
                  
                  // Target: 0.035 ETH or 100 USDC equivalent
                  const targetEth = BigInt(Math.floor(this.buyAmountEth * 1e18)); // 0.035 ETH
                  const targetUsdc = BigInt(100 * 1e6); // 100 USDC (6 decimals)
                  
                  // Check if we have enough ETH
                  let ethAmount = BigInt(0);
                  if (balances.eth >= targetEth) {
                    ethAmount = targetEth;
                    console.log(`   💰 Wallet balance: ${ethers.formatEther(balances.eth)} ETH`);
                    console.log(`   💰 Using: ${ethers.formatEther(ethAmount)} ETH (target: 0.035 ETH)`);
                  } else if (balances.usdc >= targetUsdc) {
                    // If not enough ETH, check USDC and swap if needed
                    console.log(`   💰 ETH balance insufficient: ${ethers.formatEther(balances.eth)} ETH`);
                    console.log(`   💵 USDC balance: ${(Number(balances.usdc) / 1e6).toFixed(2)} USDC`);
                    console.log(`   💵 Target: 100 USDC`);
                    
                    // For now, try with available ETH (will attempt USDC swap in buyTokenWithFallback)
                    ethAmount = balances.eth > BigInt(0) ? balances.eth : BigInt(0);
                    console.log(`   ⚠️  Will attempt purchase with available ETH: ${ethers.formatEther(ethAmount)} ETH`);
                  } else {
                    console.log(`   ⚠️  Insufficient funds: ${ethers.formatEther(balances.eth)} ETH, ${(Number(balances.usdc) / 1e6).toFixed(2)} USDC`);
                    console.log(`   ⚠️  Need: 0.035 ETH or 100 USDC`);
                    this.processedContracts.add(contractAddress);
                    continue;
                  }

                  // Try to buy with ETH/USDC fallback
                  const buyResult = await this.buyTokenWithFallback(
                    contractAddress,
                    ethAmount,
                    this.slippagePercent,
                    walletAddress
                  );

                  // Mark as processed
                  this.processedContracts.add(contractAddress);

                  if (buyResult.success) {
                    console.log(`   ✅ Successfully purchased! TX: ${buyResult.txHash}`);
                    console.log(`   📊 Tokens received: ${buyResult.tokenAmount}`);
                  } else {
                    console.log(`   ❌ Purchase failed: ${buyResult.error}`);
                  }
                }
              }
            } catch (error) {
              // Skip errors for individual transactions
              continue;
            }
          }
        } catch (error) {
          // Skip errors for individual blocks
          continue;
        }
      }
    } catch (error) {
      console.error('Error checking for new contracts:', error);
    }
  }

  /**
   * Start monitoring for contract creations
   */
  startMonitoring(intervalSeconds: number = 30): void {
    if (this.checkInterval) {
      console.log('Contract monitoring already running');
      return;
    }

    console.log(`\n🚀 Starting contract creation monitoring for ${this.monitoredAddress}`);
    console.log(`   Checking every ${intervalSeconds} seconds`);
    console.log(`   Buy amount: ${this.buyAmountEth} ETH`);
    console.log(`   Slippage: ${this.slippagePercent}%\n`);

    // Run immediately
    this.checkForNewContracts().catch(console.error);

    // Then check periodically
    this.checkInterval = setInterval(() => {
      this.checkForNewContracts().catch(console.error);
    }, intervalSeconds * 1000);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      console.log('Contract monitoring stopped');
    }
  }
}
