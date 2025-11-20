# Environment Variables Reference

Complete list of environment variables for both Railway (backend) and Vercel (frontend).

---

## 🚂 Railway (Backend) Environment Variables

### Required Variables

```env
# Neynar API Configuration
NEYNAR_API_KEY=your_neynar_api_key_here

# Wallet Configuration
PRIVATE_KEY=your_wallet_private_key_here
WALLET_ADDRESS=your_wallet_address_here

# Base Network RPC
BASE_RPC_URL=https://mainnet.base.org
# Alternative: https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### Optional Variables (with defaults)

```env
# Sniper Configuration
DEFAULT_BUY_AMOUNT_ETH=0.01
MAX_SLIPPAGE_PERCENT=5
GAS_PRICE_GWEI=0.1
SNIPER_ENABLED=true
ENABLE_BACKGROUND_MONITORING=true
CHECK_INTERVAL_SECONDS=30

# Users to Monitor (comma-separated)
MONITORED_USERS=username1,username2,12345

# Server Configuration
PORT=3001
NODE_ENV=production
```

### Variable Descriptions

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEYNAR_API_KEY` | string | ✅ | - | Your Neynar API key from [neynar.com](https://neynar.com) |
| `PRIVATE_KEY` | string | ✅ | - | Private key of wallet to use for buying tokens (without 0x prefix) |
| `WALLET_ADDRESS` | string | ✅ | - | Ethereum address of your wallet (0x...) |
| `BASE_RPC_URL` | string | ✅ | - | Base network RPC endpoint URL |
| `DEFAULT_BUY_AMOUNT_ETH` | number | No | `0.01` | Default ETH amount to spend per token purchase |
| `MAX_SLIPPAGE_PERCENT` | number | No | `5` | Maximum slippage tolerance (1-100) |
| `GAS_PRICE_GWEI` | number | No | `0.1` | Gas price in Gwei (usually auto-set) |
| `SNIPER_ENABLED` | boolean | No | `true` | Enable/disable the sniper bot |
| `ENABLE_BACKGROUND_MONITORING` | boolean | No | `true` | Enable automatic background monitoring |
| `CHECK_INTERVAL_SECONDS` | number | No | `30` | Seconds between checking for new casts |
| `MONITORED_USERS` | string | No | - | Comma-separated list of usernames or FIDs to monitor |
| `PORT` | number | No | `3001` | Port for the API server |
| `NODE_ENV` | string | No | `production` | Node.js environment |

---

## ▲ Vercel (Frontend) Environment Variables

### Required Variables

```env
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-project.railway.app
```

### Optional Variables

```env
NODE_ENV=production
```

### Variable Descriptions

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | string | ✅ | - | Full URL of your Railway backend (must start with https://) |
| `NODE_ENV` | string | No | `production` | Node.js environment |

**Note**: Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser. Only use this prefix for non-sensitive data.

---

## 📋 Quick Copy-Paste Templates

### Railway (Backend) - Minimal Setup

```env
NEYNAR_API_KEY=your_key_here
PRIVATE_KEY=your_key_here
WALLET_ADDRESS=0x...
BASE_RPC_URL=https://mainnet.base.org
```

### Railway (Backend) - Full Setup

```env
NEYNAR_API_KEY=your_key_here
PRIVATE_KEY=your_key_here
WALLET_ADDRESS=0x...
BASE_RPC_URL=https://mainnet.base.org
DEFAULT_BUY_AMOUNT_ETH=0.01
MAX_SLIPPAGE_PERCENT=5
SNIPER_ENABLED=true
ENABLE_BACKGROUND_MONITORING=true
CHECK_INTERVAL_SECONDS=30
MONITORED_USERS=vitalik,buterin
PORT=3001
NODE_ENV=production
```

### Vercel (Frontend) - Required Only

```env
NEXT_PUBLIC_API_URL=https://your-project.railway.app
```

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use Railway/Vercel secrets** - Don't hardcode values
3. **Rotate keys regularly** - Especially private keys
4. **Use dedicated wallet** - Don't use main wallet
5. **Limit permissions** - Only grant necessary permissions

---

## 🧪 Testing Environment Variables

### Backend (Railway)

Test your backend is configured correctly:

```bash
# Health check
curl https://your-project.railway.app/health

# Status (should show your config)
curl https://your-project.railway.app/api/status
```

### Frontend (Vercel)

Check browser console for:
- No CORS errors
- API calls succeeding
- Status loading correctly

---

## 📝 Example Values

### Neynar API Key
```
NEYNAR_API_KEY=NEYNAR_API_KEY_1234567890abcdef
```

### Private Key (without 0x)
```
PRIVATE_KEY=1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Wallet Address
```
WALLET_ADDRESS=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Base RPC URL
```
BASE_RPC_URL=https://mainnet.base.org
# Or with API key:
BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
```

### Monitored Users
```
MONITORED_USERS=vitalik,buterin,12345
# Mix of usernames and FIDs
```

---

## ❓ Common Issues

### "Missing required environment variable"
- Check variable name matches exactly (case-sensitive)
- Verify variable is set in Railway/Vercel dashboard
- No extra spaces or quotes

### "Invalid API key"
- Verify key is correct
- Check key hasn't expired
- Ensure no extra characters

### "Connection refused"
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify Railway backend is running
- Ensure URL starts with `https://`

### "CORS error"
- Backend has CORS enabled by default
- Check backend is accessible
- Verify frontend URL is allowed

---

## 🔄 Updating Variables

### Railway
1. Go to project dashboard
2. Click "Variables" tab
3. Add/edit variables
4. Redeploy (automatic)

### Vercel
1. Go to project settings
2. Click "Environment Variables"
3. Add/edit variables
4. Redeploy (automatic)

---

## 📚 Additional Resources

- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Neynar API Docs](https://docs.neynar.com)
- [Base Network RPC](https://docs.base.org/tools/network-faucets)
