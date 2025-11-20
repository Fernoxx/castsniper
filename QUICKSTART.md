# Quick Start Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Neynar API Key** - Get one at [neynar.com](https://neynar.com)
3. **Base Network Wallet** - With some ETH for gas and buying tokens
4. **Private Key** - For the wallet you want to use for sniping

## Setup (5 minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
# Required
NEYNAR_API_KEY=your_api_key_here
PRIVATE_KEY=your_private_key_here
WALLET_ADDRESS=your_wallet_address_here
BASE_RPC_URL=https://mainnet.base.org

# Optional (with defaults)
DEFAULT_BUY_AMOUNT_ETH=0.01
MAX_SLIPPAGE_PERCENT=5
CHECK_INTERVAL_SECONDS=30
MONITORED_USERS=username1,username2
```

### 3. Add Users to Monitor

You can specify users in two ways:

**Option A: Environment Variable**
```env
MONITORED_USERS=vitalik,buterin,12345
```

**Option B: Edit `src/index.ts`** to add users programmatically

### 4. Run the Bot

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm run build
npm start
```

## How It Works

1. The bot monitors specified Farcaster users
2. When a user posts a cast with a contract address (0x...)
3. The bot validates it's a valid ERC20 token
4. Automatically buys the token with your configured amount
5. Includes slippage protection to prevent bad trades

## Example Output

```
🚀 Farcaster Creator Coin Sniper Bot
=====================================

Configuration:
  Wallet: 0x1234...
  Default Buy Amount: 0.01 ETH
  Max Slippage: 5%
  Base RPC: https://mainnet.base.org
  Enabled: true

✅ Monitoring: vitalik (FID: 12345)
✅ Monitoring: buterin (FID: 67890)

Starting continuous monitoring (checking every 30s)...

🔎 Checking 2 monitored user(s)...

🎯 Found 1 new CA(s)!

🔍 Processing detected token: 0x9d423688eea3b5bf34a63a99ec13ca0ed280bbd2
   From user: vitalik (FID: 12345)
   Cast hash: 0xabc...
   ✅ Valid token: MyToken (MTK)
   💰 Buying with 0.01 ETH...
   ✅ Success! TX: 0xdef...
   📊 Tokens received: 1000000000000000000
```

## Safety Tips

1. **Start Small**: Test with small amounts first (0.001 ETH)
2. **Monitor**: Watch the bot for the first few transactions
3. **Dedicated Wallet**: Use a separate wallet, not your main one
4. **Gas**: Keep some ETH for gas fees
5. **Slippage**: Adjust `MAX_SLIPPAGE_PERCENT` based on volatility

## Troubleshooting

### "User not found"
- Check the username is correct
- Try using FID instead: `MONITORED_USERS=12345`

### "Buy function not found"
- The contract may use a different pattern
- Check the contract on Basescan manually

### "Transaction failed"
- Check you have enough ETH
- Verify the contract is on Base network
- Check gas price settings

### "Could not get buy quote"
- Contract may not have a quote function
- Try increasing slippage tolerance

## Advanced Configuration

### Custom Buy Amounts Per User

Edit the code in `src/index.ts` after adding users:

```typescript
const user = await sniper.addUser('username');
if (user) {
  sniper.updateUserBuyAmount(user.fid, 0.05); // 0.05 ETH for this user
}
```

### Adjust Check Interval

```env
CHECK_INTERVAL_SECONDS=10  # Check every 10 seconds (faster)
CHECK_INTERVAL_SECONDS=60  # Check every 60 seconds (slower)
```

### Disable Sniper Temporarily

```env
SNIPER_ENABLED=false
```

## Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review error messages in the console
3. Verify your configuration matches the examples

## Disclaimer

⚠️ **Use at your own risk**. This bot executes real transactions on-chain. Always test with small amounts first. The authors are not responsible for any losses.
