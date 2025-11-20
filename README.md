# Farcaster Creator Coin Sniper Bot

A sophisticated sniper bot for automatically buying Zora Creator Coins when Farcaster users post contract addresses (CAs) in their casts. Built specifically for Base network and Farcaster/Base app users.

## Features

- 🔍 **User Monitoring**: Search and monitor Farcaster users by username or FID
- 📡 **Real-time Cast Monitoring**: Uses Neynar API to monitor user casts for contract addresses
- 🎯 **CA Detection**: Automatically detects Ethereum contract addresses in cast text
- 💰 **Auto-Buy**: Automatically purchases Zora Creator Coins when detected
- 🛡️ **Slippage Protection**: Configurable slippage protection to prevent bad trades
- ⚡ **Fast Execution**: Optimized for speed to catch early opportunities
- 🔒 **Safe Trading**: Validates tokens before purchasing

## How It Works

1. **User Selection**: Add Farcaster users to monitor (by username or FID)
2. **Cast Monitoring**: Bot continuously checks user casts via Neynar API
3. **CA Detection**: When a contract address (0x...) is found in a cast, it's extracted
4. **Token Validation**: Validates the contract is a valid ERC20 token
5. **Auto-Purchase**: Buys the token with your configured amount and slippage protection

## Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Configuration

Create a `.env` file with the following variables:

```env
# Neynar API Configuration (Required)
NEYNAR_API_KEY=your_neynar_api_key_here

# Wallet Configuration (Required)
PRIVATE_KEY=your_wallet_private_key_here
WALLET_ADDRESS=your_wallet_address_here

# Base Network RPC (Required)
BASE_RPC_URL=https://mainnet.base.org
# Or use Alchemy/Infura: https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Sniper Configuration
SNIPER_ENABLED=true
DEFAULT_BUY_AMOUNT_ETH=0.01
MAX_SLIPPAGE_PERCENT=5
CHECK_INTERVAL_SECONDS=30

# Users to Monitor (comma-separated usernames or FIDs)
MONITORED_USERS=username1,username2,12345
```

### Getting a Neynar API Key

1. Visit [Neynar](https://neynar.com)
2. Sign up for an account
3. Create an API key in the dashboard
4. Add it to your `.env` file

## Usage

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
# Build TypeScript
npm run build

# Run
npm start
```

### Example

```bash
# Set users to monitor
export MONITORED_USERS="vitalik,buterin"

# Run the bot
npm run dev
```

The bot will:
1. Search for the users on Farcaster
2. Start monitoring their casts
3. Automatically buy any Creator Coins they post

## Zora Creator Coin Contract Patterns

The bot handles multiple Zora Creator Coin contract patterns:

- `buy(uint256 minTokensOut)` - Standard buy with slippage protection
- `buy(uint256 minTokensOut, address recipient)` - Buy with recipient
- `buy()` - Simple buy function
- `getBuyQuote(uint256 ethAmount)` - Get quote before buying
- `price()` - Get current price

The bot automatically detects which pattern the contract uses and calls the appropriate function.

## Slippage Protection

The bot includes built-in slippage protection:

1. Gets a buy quote before purchasing
2. Calculates minimum tokens with slippage tolerance
3. Only executes if the trade meets your slippage requirements
4. Prevents buying at unfavorable prices

## Safety Features

- ✅ Validates contract addresses before purchasing
- ✅ Checks token is a valid ERC20
- ✅ Slippage protection
- ✅ Duplicate detection (won't buy the same token twice from same cast)
- ✅ Error handling and logging
- ✅ Configurable buy amounts per user

## Project Structure

```
src/
├── index.ts                 # Main entry point
├── types/
│   └── index.ts            # TypeScript interfaces
├── services/
│   ├── neynar.service.ts   # Neynar API integration
│   ├── zora-creator-coin.service.ts  # Zora token interaction
│   └── sniper.service.ts   # Main sniper logic
└── utils/
    └── address.ts          # Address validation utilities
```

## Important Notes

⚠️ **Security**:
- Never share your private key
- Use a dedicated wallet for sniping
- Start with small amounts to test
- Monitor your transactions

⚠️ **Risks**:
- Trading cryptocurrencies carries risk
- Slippage can still occur in volatile markets
- Some tokens may have taxes or fees
- Always do your own research (DYOR)

⚠️ **Rate Limits**:
- Neynar API has rate limits
- The bot includes delays to respect limits
- Adjust `CHECK_INTERVAL_SECONDS` if needed

## Troubleshooting

### "User not found"
- Verify the username or FID is correct
- Check Neynar API key is valid

### "Buy function not found"
- The contract may use a different pattern
- Check the contract manually on Basescan

### "Transaction failed"
- Check you have enough ETH for gas
- Verify the contract is on Base network
- Check slippage settings

### "Could not get buy quote"
- Contract may not have a quote function
- Try increasing slippage tolerance

## License

MIT

## Disclaimer

This bot is for educational purposes. Use at your own risk. Always test with small amounts first. The authors are not responsible for any losses incurred.
