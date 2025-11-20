# Project Structure

This document explains the project structure and how the backend and frontend work together.

## 📁 Directory Structure

```
/workspace
├── backend/                 # Backend API (Railway deployment)
│   ├── src/
│   │   ├── api/            # Express API routes
│   │   ├── services/       # Core services (sniper, neynar, zora)
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   └── contracts/      # Contract patterns
│   ├── package.json
│   ├── tsconfig.json
│   ├── railway.json        # Railway deployment config
│   └── Procfile           # Railway process file
│
├── frontend/               # Frontend Web App (Vercel deployment)
│   ├── app/               # Next.js app directory
│   │   ├── page.tsx       # Main page
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Global styles
│   ├── package.json
│   ├── tsconfig.json
│   ├── next.config.js
│   └── vercel.json        # Vercel deployment config
│
├── src/                    # Original CLI version (legacy)
│   └── ...                # Core sniper logic (shared with backend)
│
├── .railwayignore         # Files to ignore for Railway
├── DEPLOYMENT.md          # Deployment guide
├── ENV_VARIABLES.md       # Environment variables reference
└── README.md             # Main README
```

## 🔄 How It Works

### Backend (Railway)

The backend is an Express API server that:

1. **Exposes REST API** for managing the sniper bot
2. **Runs background monitoring** (optional, via `ENABLE_BACKGROUND_MONITORING`)
3. **Handles all blockchain interactions** (buying tokens, validating contracts)
4. **Manages monitored users** (add, remove, update)

**Key Files:**
- `backend/src/api/index.ts` - Express API routes
- `backend/src/index.ts` - Background monitoring setup
- `backend/src/services/` - Core sniper logic

### Frontend (Vercel)

The frontend is a Next.js web app that:

1. **Connects to backend API** via `NEXT_PUBLIC_API_URL`
2. **Provides UI** for managing monitored users
3. **Shows real-time status** of the sniper bot
4. **Allows manual triggers** for check cycles

**Key Files:**
- `frontend/app/page.tsx` - Main UI component
- `frontend/app/layout.tsx` - Root layout
- `frontend/app/globals.css` - Styling

## 🔌 Communication Flow

```
User (Browser)
    ↓
Frontend (Vercel)
    ↓ HTTP Requests
Backend API (Railway)
    ↓
Sniper Service
    ↓
Neynar API / Blockchain
```

## 📦 Deployment Separation

### Railway (Backend)
- Only deploys `/backend` folder
- `.railwayignore` excludes frontend files
- Runs Node.js Express server
- Handles all sensitive operations

### Vercel (Frontend)
- Only deploys `/frontend` folder
- `.vercelignore` excludes backend files
- Runs Next.js static/SSR app
- Only needs backend URL

## 🔐 Security Architecture

```
┌─────────────────┐
│   Frontend      │  (Public, Vercel)
│   (Next.js)     │  - Only UI
│                 │  - No secrets
└────────┬────────┘
         │ HTTPS
         │ API Calls
         ↓
┌─────────────────┐
│   Backend       │  (Private, Railway)
│   (Express)     │  - All secrets here
│                 │  - Private keys
│                 │  - API keys
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Blockchain     │
│   Neynar API    │
└─────────────────┘
```

## 🚀 Development Workflow

### Local Development

1. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   # Runs on http://localhost:3001
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   # Runs on http://localhost:3000
   ```

3. **Configure Frontend:**
   Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

### Production Deployment

1. **Deploy Backend to Railway:**
   - Connect GitHub repo
   - Set root directory to `/backend`
   - Add environment variables
   - Deploy

2. **Deploy Frontend to Vercel:**
   - Connect GitHub repo
   - Set root directory to `/frontend`
   - Add `NEXT_PUBLIC_API_URL` with Railway URL
   - Deploy

## 📝 Key Differences from CLI Version

The original CLI version (`/src`) is now integrated into the backend:

- **CLI Version**: Direct execution, command-line interface
- **Backend Version**: API server, can be controlled via HTTP
- **Frontend Version**: Web UI for easy management

All three share the same core services in `backend/src/services/`.

## 🔧 Configuration Files

### Railway
- `backend/railway.json` - Railway build/deploy config
- `backend/Procfile` - Process definition
- `.railwayignore` - Files to exclude

### Vercel
- `frontend/vercel.json` - Vercel deployment config
- `frontend/.vercelignore` - Files to exclude

## 📚 Next Steps

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions
2. Check [ENV_VARIABLES.md](./ENV_VARIABLES.md) for environment setup
3. Deploy backend to Railway
4. Deploy frontend to Vercel
5. Start monitoring users!
