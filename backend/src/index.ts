import './api/index.js';

// Initialize and start background monitoring automatically
import { startBackgroundMonitoring } from './services/sniper.service.singleton.js';
import dotenv from 'dotenv';

dotenv.config();

// Start background monitoring automatically when server starts
// Users are added via the web API, and monitoring will check them automatically
if (process.env.ENABLE_BACKGROUND_MONITORING !== 'false') {
  try {
    startBackgroundMonitoring();
  } catch (error) {
    console.error('Failed to start background monitoring:', error);
  }
}
