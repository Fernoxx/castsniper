/**
 * Zora Creator Coin Contract Patterns
 * 
 * This file documents common patterns found in Zora Creator Coin contracts.
 * Based on analysis of contracts like: 0x9d423688eea3b5bf34a63a99ec13ca0ed280bbd2
 */

// Common bonding curve patterns
export const ZORA_PATTERNS = {
  // Standard buy with slippage protection
  BUY_WITH_SLIPPAGE: 'buy(uint256 minTokensOut)',
  
  // Buy with recipient
  BUY_WITH_RECIPIENT: 'buy(uint256 minTokensOut, address recipient)',
  
  // Simple buy
  BUY_SIMPLE: 'buy()',
  
  // Buy with custom parameters
  BUY_CUSTOM: 'buy(uint256,address,bytes)',
  
  // Quote functions
  GET_BUY_QUOTE: 'getBuyQuote(uint256 ethAmount)',
  GET_SELL_QUOTE: 'getSellQuote(uint256 tokenAmount)',
  PRICE: 'price()',
  
  // Reserve functions (for bonding curves)
  RESERVE_ETH: 'reserveETH()',
  RESERVE_TOKEN: 'reserveToken()',
};

/**
 * Extended ABI for Zora Creator Coins
 * Includes common patterns found across different implementations
 */
export const ZORA_EXTENDED_ABI = [
  // ERC20 Standard
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
  'function balanceOf(address) view returns (uint256)',
  
  // Buy functions (try multiple patterns)
  'function buy(uint256 minTokensOut) payable returns (uint256 tokensOut)',
  'function buy(uint256 minTokensOut, address recipient) payable returns (uint256 tokensOut)',
  'function buy() payable returns (uint256)',
  'function buy(uint256 minTokensOut, address recipient, bytes data) payable returns (uint256)',
  
  // Quote functions
  'function getBuyQuote(uint256 ethAmount) view returns (uint256 tokensOut)',
  'function getSellQuote(uint256 tokenAmount) view returns (uint256 ethOut)',
  'function price() view returns (uint256)',
  'function getPrice() view returns (uint256)',
  'function getBuyPrice(uint256 amount) view returns (uint256)',
  'function getSellPrice(uint256 amount) view returns (uint256)',
  
  // Reserve functions (bonding curve)
  'function reserveETH() view returns (uint256)',
  'function reserveToken() view returns (uint256)',
  'function virtualETHReserve() view returns (uint256)',
  'function virtualTokenReserve() view returns (uint256)',
  
  // Events
  'event Buy(address indexed buyer, uint256 ethAmount, uint256 tokenAmount)',
  'event Sell(address indexed seller, uint256 tokenAmount, uint256 ethAmount)',
];

/**
 * Common contract bytecode patterns for Zora Creator Coins
 * These can help identify if a contract is a Zora Creator Coin
 */
export const ZORA_BYTECODE_PATTERNS = {
  // Common function selectors
  BUY_SELECTORS: [
    '0x6945b123', // buy(uint256)
    '0x3593564c', // buy()
    '0x02751cec', // buy(uint256,address)
  ],
  
  // Factory patterns (if checking factory deployment)
  FACTORY_ADDRESSES: [
    '0x0000000000000000000000000000000000000000', // Update with actual factory
  ],
};

/**
 * Tax detection patterns
 * Some tokens have buy/sell taxes
 */
export const TAX_PATTERNS = {
  // Common tax function names
  TAX_FUNCTIONS: [
    'taxFee',
    'buyTax',
    'sellTax',
    'transferTax',
  ],
  
  // Check for transfer hooks that might indicate taxes
  TRANSFER_HOOKS: [
    '_beforeTokenTransfer',
    '_afterTokenTransfer',
    'takeFee',
  ],
};
