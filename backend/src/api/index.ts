import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { ethers } from 'ethers';
import { getSniperService, startBackgroundMonitoring, stopBackgroundMonitoring } from '../services/sniper.service.singleton.js';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get sniper status
app.get('/api/status', (req: Request, res: Response) => {
  try {
    const sniper = getSniperService();
    const users = sniper.getMonitoredUsers();
    res.json({
      enabled: sniper['config'].enabled,
      monitoredUsers: users.length,
      users: users,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add user to monitor
app.post('/api/users', async (req: Request, res: Response) => {
  try {
    const { usernameOrFid, buyAmountEth, slippagePercent } = req.body;

    if (!usernameOrFid) {
      return res.status(400).json({ error: 'usernameOrFid is required' });
    }

    const sniper = getSniperService();
    const identifier = typeof usernameOrFid === 'string' && /^\d+$/.test(usernameOrFid)
      ? parseInt(usernameOrFid)
      : usernameOrFid;

    const user = await sniper.addUser(
      identifier,
      buyAmountEth ? parseFloat(buyAmountEth) : undefined,
      slippagePercent ? parseFloat(slippagePercent) : undefined
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove user from monitoring
app.delete('/api/users/:fid', (req: Request, res: Response) => {
  try {
    const fid = parseInt(req.params.fid);
    const sniper = getSniperService();
    const removed = sniper.removeUser(fid);

    if (removed) {
      res.json({ success: true, message: 'User removed from monitoring' });
    } else {
      res.status(404).json({ error: 'User not found in monitoring list' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all monitored users
app.get('/api/users', (req: Request, res: Response) => {
  try {
    const sniper = getSniperService();
    const users = sniper.getMonitoredUsers();
    res.json({ users });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user buy amount
app.patch('/api/users/:fid', (req: Request, res: Response) => {
  try {
    const fid = parseInt(req.params.fid);
    const { buyAmountEth } = req.body;

    if (!buyAmountEth) {
      return res.status(400).json({ error: 'buyAmountEth is required' });
    }

    const sniper = getSniperService();
    const updated = sniper.updateUserBuyAmount(fid, parseFloat(buyAmountEth));

    if (updated) {
      res.json({ success: true, message: 'Buy amount updated' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger check cycle
app.post('/api/check', async (req: Request, res: Response) => {
  try {
    const sniper = getSniperService();
    await sniper.runCheckCycle();
    res.json({ success: true, message: 'Check cycle completed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start/stop monitoring
app.post('/api/monitoring/:action', (req: Request, res: Response) => {
  try {
    const action = req.params.action;

    if (action === 'start') {
      startBackgroundMonitoring();
      res.json({ success: true, message: 'Monitoring started' });
    } else if (action === 'stop') {
      stopBackgroundMonitoring();
      res.json({ success: true, message: 'Monitoring stopped' });
    } else {
      res.status(400).json({ error: 'Invalid action. Use "start" or "stop"' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get contract monitor status
app.get('/api/contract-monitor/status', async (req: Request, res: Response) => {
  try {
    const sniper = getSniperService();
    const walletAddress = await sniper['zora'].getWalletAddress();
    
    // Get balances
    const { ContractMonitorService } = await import('../services/contract-monitor.service.js');
    const baseRpcUrl = sniper['config'].baseRpcUrl;
    const tempMonitor = new ContractMonitorService(
      baseRpcUrl,
      sniper['zora'],
      '0x0000000000000000000000000000000000000000', // dummy address
      0.035,
      15
    );
    const balances = await tempMonitor.getWalletBalances(walletAddress);
    
    res.json({
      walletAddress,
      balances: {
        eth: ethers.formatEther(balances.eth),
        usdc: (Number(balances.usdc) / 1e6).toFixed(2),
      },
      targetAmounts: {
        eth: '0.035',
        usdc: '100',
      },
      monitoredAddress: '0xd211b9417f28d128435cd8d022aeaebbc8a28f17',
      slippagePercent: 15,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend API server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📊 API status: http://localhost:${PORT}/api/status`);
  console.log(`🏗️  Contract monitor status: http://localhost:${PORT}/api/contract-monitor/status`);
});
