# Deployment Guide

This project consists of two parts:
- **Backend API** - Deploy to Railway
- **Frontend Web App** - Deploy to Vercel

## Backend Deployment (Railway)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or use Railway CLI)
4. Connect your repository

### Step 2: Configure Build Settings

Railway will auto-detect the backend folder. Make sure:
- **Root Directory**: `/backend` (or set in railway.json)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Step 3: Set Environment Variables

Add these environment variables in Railway dashboard:

```env
# Required
NEYNAR_API_KEY=your_neynar_api_key_here
PRIVATE_KEY=your_wallet_private_key_here
WALLET_ADDRESS=your_wallet_address_here
BASE_RPC_URL=https://mainnet.base.org

# Optional (with defaults)
DEFAULT_BUY_AMOUNT_ETH=0.01
MAX_SLIPPAGE_PERCENT=5
GAS_PRICE_GWEI=0.1
SNIPER_ENABLED=true
ENABLE_BACKGROUND_MONITORING=true
CHECK_INTERVAL_SECONDS=30
MONITORED_USERS=username1,username2,12345

# Server
PORT=3001
NODE_ENV=production
```

### Step 4: Deploy

Railway will automatically deploy when you push to your repository. Or click "Deploy" in the dashboard.

### Step 5: Get Backend URL

After deployment, Railway will provide a URL like:
```
https://your-project.railway.app
```

Copy this URL - you'll need it for the frontend!

---

## Frontend Deployment (Vercel)

### Step 1: Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project

### Step 2: Configure Build Settings

- **Framework Preset**: Next.js
- **Root Directory**: `/frontend`
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)

### Step 3: Set Environment Variables

Add these environment variables in Vercel dashboard:

```env
# Required - Your Railway backend URL
NEXT_PUBLIC_API_URL=https://your-project.railway.app

# Optional
NODE_ENV=production
```

**Important**: Replace `https://your-project.railway.app` with your actual Railway backend URL!

### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy your frontend automatically.

---

## Environment Variables Summary

### Railway (Backend) Variables

| Variable | Required | Default | Description |
|----------|----------|---------|------------|
| `NEYNAR_API_KEY` | ✅ Yes | - | Your Neynar API key |
| `PRIVATE_KEY` | ✅ Yes | - | Wallet private key for buying tokens |
| `WALLET_ADDRESS` | ✅ Yes | - | Your wallet address |
| `BASE_RPC_URL` | ✅ Yes | - | Base network RPC endpoint |
| `DEFAULT_BUY_AMOUNT_ETH` | No | `0.01` | Default ETH amount per buy |
| `MAX_SLIPPAGE_PERCENT` | No | `5` | Maximum slippage tolerance (%) |
| `GAS_PRICE_GWEI` | No | `0.1` | Gas price in Gwei |
| `SNIPER_ENABLED` | No | `true` | Enable/disable sniper |
| `ENABLE_BACKGROUND_MONITORING` | No | `true` | Enable background monitoring |
| `CHECK_INTERVAL_SECONDS` | No | `30` | Seconds between checks |
| `MONITORED_USERS` | No | - | Comma-separated usernames/FIDs |
| `PORT` | No | `3001` | Server port |
| `NODE_ENV` | No | `production` | Node environment |

### Vercel (Frontend) Variables

| Variable | Required | Default | Description |
|----------|----------|---------|------------|
| `NEXT_PUBLIC_API_URL` | ✅ Yes | - | Your Railway backend URL |
| `NODE_ENV` | No | `production` | Node environment |

---

## Quick Setup Checklist

### Backend (Railway)
- [ ] Create Railway project
- [ ] Set root directory to `/backend`
- [ ] Add all required environment variables
- [ ] Deploy and get backend URL
- [ ] Test health endpoint: `https://your-project.railway.app/health`

### Frontend (Vercel)
- [ ] Create Vercel project
- [ ] Set root directory to `/frontend`
- [ ] Add `NEXT_PUBLIC_API_URL` with your Railway URL
- [ ] Deploy
- [ ] Test frontend connects to backend

---

## Testing Deployment

### Test Backend API

```bash
# Health check
curl https://your-project.railway.app/health

# Get status
curl https://your-project.railway.app/api/status
```

### Test Frontend

1. Visit your Vercel URL
2. Check if status loads
3. Try adding a user
4. Verify it connects to backend

---

## Troubleshooting

### Backend Issues

**"Missing environment variable"**
- Check all required variables are set in Railway
- Verify variable names match exactly (case-sensitive)

**"Port already in use"**
- Railway handles this automatically, but check PORT variable

**"Connection refused"**
- Check Railway deployment logs
- Verify build completed successfully

### Frontend Issues

**"Failed to fetch"**
- Check `NEXT_PUBLIC_API_URL` is correct
- Verify Railway backend is running
- Check CORS settings (should be enabled in backend)

**"API URL not found"**
- Ensure `NEXT_PUBLIC_API_URL` starts with `https://`
- No trailing slash in URL

### CORS Issues

The backend has CORS enabled by default. If you have issues:
- Check backend allows your Vercel domain
- Verify `cors` middleware is working

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit private keys** - Use environment variables only
2. **Use Railway/Vercel secrets** - Don't expose sensitive data
3. **Limit API access** - Consider adding authentication
4. **Monitor logs** - Check for suspicious activity
5. **Use dedicated wallet** - Don't use your main wallet

---

## Updating Deployments

### Backend Updates
1. Push changes to GitHub
2. Railway auto-deploys (or trigger manually)
3. Check deployment logs

### Frontend Updates
1. Push changes to GitHub
2. Vercel auto-deploys
3. Check build logs

---

## Monitoring

### Railway
- View logs in Railway dashboard
- Set up alerts for errors
- Monitor resource usage

### Vercel
- View build logs
- Check analytics
- Monitor performance

---

## Support

For deployment issues:
1. Check deployment logs
2. Verify environment variables
3. Test endpoints manually
4. Review error messages
