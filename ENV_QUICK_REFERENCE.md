# Environment Variables Quick Reference

## 🚂 Railway (Backend) - Copy & Paste

```env
NEYNAR_API_KEY=your_neynar_api_key_here
PRIVATE_KEY=your_wallet_private_key_here
WALLET_ADDRESS=0xYourWalletAddressHere
BASE_RPC_URL=https://mainnet.base.org
DEFAULT_BUY_AMOUNT_ETH=0.01
MAX_SLIPPAGE_PERCENT=5
SNIPER_ENABLED=true
ENABLE_BACKGROUND_MONITORING=true
CHECK_INTERVAL_SECONDS=30
MONITORED_USERS=username1,username2
PORT=3001
NODE_ENV=production
```

## ▲ Vercel (Frontend) - Copy & Paste

```env
NEXT_PUBLIC_API_URL=https://your-project.railway.app
NODE_ENV=production
```

**Important:** Replace `https://your-project.railway.app` with your actual Railway backend URL!

---

## 📝 Step-by-Step Setup

### 1. Railway Setup

1. Go to Railway dashboard → Your Project → Variables
2. Click "New Variable"
3. Add each variable from the list above
4. Replace placeholder values with your actual keys
5. Save and redeploy

### 2. Vercel Setup

1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Add `NEXT_PUBLIC_API_URL` with your Railway URL
4. Save and redeploy

---

## ✅ Verification Checklist

### Backend (Railway)
- [ ] All required variables added
- [ ] `NEYNAR_API_KEY` is valid
- [ ] `PRIVATE_KEY` is correct (no 0x prefix)
- [ ] `WALLET_ADDRESS` matches private key
- [ ] `BASE_RPC_URL` is accessible
- [ ] Backend deploys successfully
- [ ] Health check works: `https://your-project.railway.app/health`

### Frontend (Vercel)
- [ ] `NEXT_PUBLIC_API_URL` is set
- [ ] URL matches your Railway backend
- [ ] URL starts with `https://`
- [ ] No trailing slash in URL
- [ ] Frontend deploys successfully
- [ ] Frontend can connect to backend

---

## 🔍 Testing

### Test Backend
```bash
curl https://your-project.railway.app/health
curl https://your-project.railway.app/api/status
```

### Test Frontend
1. Visit your Vercel URL
2. Check browser console for errors
3. Verify status loads
4. Try adding a user

---

## ⚠️ Common Mistakes

1. **Missing `NEXT_PUBLIC_` prefix** - Frontend won't see the variable
2. **Wrong Railway URL** - Frontend can't connect
3. **Private key with 0x** - Should be without prefix
4. **Trailing slash in URL** - Can cause connection issues
5. **Wrong environment** - Make sure variables are in correct project

---

For detailed information, see [ENV_VARIABLES.md](./ENV_VARIABLES.md)
