# Farcaster Creator Coin Sniper

A full-stack application for automatically buying Zora Creator Coins when Farcaster users post contract addresses in their casts.

## 🏗️ Project Structure

This project consists of three main parts:

- **Backend API** (`/backend`) - Express API server deployed to Railway
- **Frontend Web App** (`/frontend`) - Next.js app deployed to Vercel  
- **Core Library** (`/src`) - Shared sniper bot logic (original CLI version)

## 🚀 Quick Start

### Backend (Railway)

1. Navigate to backend folder: `cd backend`
2. Install: `npm install`
3. Configure: Copy `.env.example` to `.env` and add your keys
4. Run: `npm run dev`

### Frontend (Vercel)

1. Navigate to frontend folder: `cd frontend`
2. Install: `npm install`
3. Configure: Set `NEXT_PUBLIC_API_URL` in `.env.local`
4. Run: `npm run dev`

## 📦 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Railway (Backend)
- Deploy `/backend` folder
- Set environment variables (see [ENV_VARIABLES.md](./ENV_VARIABLES.md))
- Get backend URL

### Vercel (Frontend)
- Deploy `/frontend` folder
- Set `NEXT_PUBLIC_API_URL` to your Railway URL
- Deploy!

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [ENV_VARIABLES.md](./ENV_VARIABLES.md) - Environment variables reference
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Project structure explanation
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide (original CLI version)

## 🔧 Development

### Backend API
```bash
cd backend
npm install
npm run dev
# Runs on http://localhost:3001
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:3000
```

## 📋 Environment Variables

### Railway (Backend)
See [ENV_VARIABLES.md](./ENV_VARIABLES.md#-railway-backend-environment-variables) for complete list.

**Required:**
- `NEYNAR_API_KEY`
- `PRIVATE_KEY`
- `WALLET_ADDRESS`
- `BASE_RPC_URL`

### Vercel (Frontend)
**Required:**
- `NEXT_PUBLIC_API_URL` - Your Railway backend URL

## 🎯 Features

- 🔍 **User Monitoring**: Search and monitor Farcaster users
- 📡 **Real-time Cast Monitoring**: Uses Neynar API
- 🎯 **CA Detection**: Automatically detects contract addresses
- 💰 **Auto-Buy**: Purchases tokens when detected
- 🛡️ **Slippage Protection**: Configurable protection
- ⚡ **Fast Execution**: Optimized for speed
- 🔒 **Safe Trading**: Validates tokens before purchasing
- 🌐 **Web Interface**: Manage users via web UI

## 📖 API Endpoints

- `GET /health` - Health check
- `GET /api/status` - Get sniper status
- `POST /api/users` - Add user to monitor
- `DELETE /api/users/:fid` - Remove user
- `GET /api/users` - List all users
- `PATCH /api/users/:fid` - Update user settings
- `POST /api/check` - Manual check trigger

## ⚠️ Security Notes

- Never commit private keys
- Use environment variables only
- Use dedicated wallet for sniping
- Start with small amounts
- Monitor transactions

## 📄 License

MIT

## ⚠️ Disclaimer

This bot is for educational purposes. Use at your own risk. Always test with small amounts first. The authors are not responsible for any losses.
