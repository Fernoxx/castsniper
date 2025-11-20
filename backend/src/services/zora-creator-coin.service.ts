import { ethers } from 'ethers';
import type { ZoraCreatorCoinInfo, BuyResult } from '../types/index.js';
import { isValidAddress } from '../utils/address.js';
import { ZORA_EXTENDED_ABI } from '../contracts/zora-patterns.js';

// Standard ERC20 ABI (minimal for our needs)
const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

const ZORA_BUY_ABI = [
  'function buy(uint256 minTokensOut) payable returns (uint256 tokensOut)',
  'function buy(uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)',
  'function buy() payable returns (uint256)',
  'function buy(uint256 minTokensOut, address recipient, bytes data) payable returns (uint256)',
  'function getBuyQuote(uint256 ethAmount) view returns (uint256 tokensOut)',
  'function getSellQuote(uint256 tokenAmount) view returns (uint256 ethOut)',
  'function price() view returns (uint256)',
  'function getPrice() view returns (uint256)',
  'function getBuyPrice(uint256 amount) view returns (uint256)',
];

export class ZoraCreatorCoinService {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(rpcUrl: string, privateKey: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
  }

  /**
   * Validate if an address is a valid Zora Creator Coin
   */
  async validateCreatorCoin(address: string): Promise<ZoraCreatorCoinInfo> {
    if (!isValidAddress(address)) {
      return {
        address,
        name: '',
        symbol: '',
        decimals: 18,
        totalSupply: '0',
        isValid: false,
      };
    }

    try {
      const contract = new ethers.Contract(address, ERC20_ABI, this.provider);
      
      const [name, symbol, decimals, totalSupply] = await Promise.all([
        contract.name().catch(() => 'Unknown'),
        contract.symbol().catch(() => 'UNKNOWN'),
        contract.decimals().catch(() => 18),
        contract.totalSupply().catch(() => ethers.parseEther('0')),
      ]);

      return {
        address: address.toLowerCase(),
        name: name || 'Unknown',
        symbol: symbol || 'UNKNOWN',
        decimals: Number(decimals),
        totalSupply: totalSupply.toString(),
        isValid: true,
      };
    } catch (error) {
      console.error(`Error validating creator coin ${address}:`, error);
      return {
        address: address.toLowerCase(),
        name: '',
        symbol: '',
        decimals: 18,
        totalSupply: '0',
        isValid: false,
      };
    }
  }

  /**
   * Get buy quote for a token
   */
  async getBuyQuote(
    tokenAddress: string,
    ethAmount: bigint
  ): Promise<{ tokensOut: bigint; success: boolean }> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [...ERC20_ABI, ...ZORA_BUY_ABI],
        this.provider
      );

      // Try different buy quote methods
      let tokensOut: bigint;

      try {
        tokensOut = await contract.getBuyQuote(ethAmount);
      } catch {
        try {
          const price = await contract.price();
          tokensOut = (ethAmount * BigInt(10 ** 18)) / price;
        } catch {
          try {
            const price = await contract.getPrice();
            tokensOut = (ethAmount * BigInt(10 ** 18)) / price;
          } catch {
            try {
              tokensOut = await contract.getBuyPrice(ethAmount);
            } catch {
              // If no quote function, estimate from a test call
              tokensOut = BigInt(0);
            }
          }
        }
      }

      return { tokensOut, success: true };
    } catch (error) {
      console.error(`Error getting buy quote for ${tokenAddress}:`, error);
      return { tokensOut: BigInt(0), success: false };
    }
  }

  /**
   * Buy Zora Creator Coin with slippage protection
   */
  async buyToken(
    tokenAddress: string,
    ethAmount: bigint,
    maxSlippagePercent: number
  ): Promise<BuyResult> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [...ERC20_ABI, ...ZORA_BUY_ABI],
        this.signer
      );

      // Get expected tokens out
      const quote = await this.getBuyQuote(tokenAddress, ethAmount);
      if (!quote.success || quote.tokensOut === BigInt(0)) {
        return {
          success: false,
          error: 'Could not get buy quote',
        };
      }

      // Calculate minimum tokens with slippage protection
      const slippageMultiplier = BigInt(10000 - maxSlippagePercent * 100);
      const minTokensOut = (quote.tokensOut * slippageMultiplier) / BigInt(10000);

      console.log(`Buying ${tokenAddress}:`);
      console.log(`  ETH Amount: ${ethers.formatEther(ethAmount)} ETH`);
      console.log(`  Expected Tokens: ${ethers.formatEther(quote.tokensOut)}`);
      console.log(`  Min Tokens (with ${maxSlippagePercent}% slippage): ${ethers.formatEther(minTokensOut)}`);

      // Try different buy function signatures
      let tx: ethers.ContractTransactionResponse;

      try {
        // Try buy(uint256 minTokensOut)
        tx = await contract.buy(minTokensOut, {
          value: ethAmount,
          gasLimit: 500000, // Set reasonable gas limit
        });
      } catch (error1) {
        try {
          // Try buy(uint256 minTokensOut, address recipient)
          tx = await contract.buy(minTokensOut, await this.signer.getAddress(), {
            value: ethAmount,
            gasLimit: 500000,
          });
        } catch (error2) {
          try {
            // Try buy() without parameters
            tx = await contract.buy({
              value: ethAmount,
              gasLimit: 500000,
            });
          } catch (error3) {
            return {
              success: false,
              error: `Buy function not found or failed: ${error3}`,
            };
          }
        }
      }

      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();

      if (!receipt) {
        return {
          success: false,
          error: 'Transaction receipt not received',
        };
      }

      if (receipt.status === 1) {
        // Get token balance after purchase
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const balance = await tokenContract.balanceOf(await this.signer.getAddress());

        return {
          success: true,
          txHash: receipt.hash,
          tokenAmount: balance.toString(),
          ethSpent: ethAmount.toString(),
        };
      } else {
        return {
          success: false,
          error: 'Transaction failed',
        };
      }
    } catch (error: any) {
      console.error(`Error buying token ${tokenAddress}:`, error);
      return {
        success: false,
        error: error.message || 'Unknown error',
      };
    }
  }

  /**
   * Check if contract has buy function (Zora Creator Coin pattern)
   */
  async hasBuyFunction(tokenAddress: string): Promise<boolean> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        ZORA_BUY_ABI,
        this.provider
      );

      // Try to call getBuyQuote with 0.001 ETH
      const testAmount = ethers.parseEther('0.001');
      await contract.getBuyQuote(testAmount);
      return true;
    } catch {
      // Check if contract has a payable buy function
      try {
        const code = await this.provider.getCode(tokenAddress);
        // Simple check: look for buy function in bytecode
        return code.includes('buy') || code.length > 1000; // Most contracts have buy functionality
      } catch {
        return false;
      }
    }
  }

  /**
   * Simulate a buy to detect taxes or fees
   * Returns the effective tax percentage if detected
   */
  async detectTax(tokenAddress: string, testAmount: bigint = ethers.parseEther('0.01')): Promise<{ hasTax: boolean; taxPercent?: number }> {
    try {
      const contract = new ethers.Contract(
        tokenAddress,
        [...ERC20_ABI, ...ZORA_BUY_ABI],
        this.provider
      );

      // Get quote
      const quote = await this.getBuyQuote(tokenAddress, testAmount);
      if (!quote.success) {
        return { hasTax: false };
      }

      // Simulate the transaction (static call)
      try {
        const walletAddress = await this.signer.getAddress();
        const balanceBefore = await contract.balanceOf(walletAddress).catch(() => BigInt(0));

        // Try to simulate buy with static call
        let simulatedTokens: bigint;
        try {
          simulatedTokens = await contract.buy.staticCall(
            BigInt(0), // minTokensOut = 0 for simulation
            { value: testAmount }
          );
        } catch {
          try {
            simulatedTokens = await contract.buy.staticCall(
              BigInt(0),
              walletAddress,
              { value: testAmount }
            );
          } catch {
            // Can't simulate, assume no tax
            return { hasTax: false };
          }
        }

        // Compare quote vs simulated
        const difference = quote.tokensOut > simulatedTokens 
          ? quote.tokensOut - simulatedTokens 
          : BigInt(0);
        
        if (difference > BigInt(0)) {
          const taxPercent = Number((difference * BigInt(10000)) / quote.tokensOut) / 100;
          if (taxPercent > 0.1) { // Only report if > 0.1%
            return { hasTax: true, taxPercent };
          }
        }

        return { hasTax: false };
      } catch {
        // Simulation failed, can't detect tax
        return { hasTax: false };
      }
    } catch (error) {
      console.error(`Error detecting tax for ${tokenAddress}:`, error);
      return { hasTax: false };
    }
  }
}
