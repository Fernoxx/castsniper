# Backend API Server

Express API server for the Farcaster Creator Coin Sniper bot.

## Features

- RESTful API for managing monitored users
- Background monitoring service
- Health check endpoints
- CORS enabled for frontend access

## API Endpoints

### Health Check
```
GET /health
```
Returns server status.

### Get Status
```
GET /api/status
```
Returns sniper status and monitored users.

### Add User
```
POST /api/users
Body: { usernameOrFid: string, buyAmountEth?: number }
```
Add a user to monitor.

### Remove User
```
DELETE /api/users/:fid
```
Remove a user from monitoring.

### Get All Users
```
GET /api/users
```
Get list of all monitored users.

### Update User Buy Amount
```
PATCH /api/users/:fid
Body: { buyAmountEth: number }
```
Update buy amount for a user.

### Manual Check
```
POST /api/check
```
Manually trigger a check cycle.

## Environment Variables

See `ENV_VARIABLES.md` for complete list.

## Development

```bash
npm install
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Deployment

Deploy to Railway - see `DEPLOYMENT.md` for details.
