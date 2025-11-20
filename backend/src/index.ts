import './api/index.js';

// Initialize and start background monitoring automatically
import { startBackgroundMonitoring } from './services/sniper.service.singleton.js';
import dotenv from 'dotenv';

dotenv.config();

// Start background monitoring automatically when server starts
// Auto-monitored users (from config) are added first, then monitoring starts
// Additional users can be added via the web API
if (process.env.ENABLE_BACKGROUND_MONITORING !== 'false') {
  startBackgroundMonitoring().catch((error) => {
    console.error('Failed to start background monitoring:', error);
  });
}
