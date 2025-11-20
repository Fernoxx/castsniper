import { NeynarAPIClient, Configuration } from '@neynar/nodejs-sdk';
import type { MonitoredUser, DetectedToken } from '../types/index.js';

export class NeynarService {
  private client: NeynarAPIClient;
  private lastCheckedTimestamps: Map<number, number> = new Map();

  constructor(apiKey: string) {
    const config = new Configuration({ apiKey });
    this.client = new NeynarAPIClient(config);
  }

  /**
   * Search for a Farcaster user by username
   */
  async searchUser(username: string): Promise<{ fid: number; username: string } | null> {
    try {
      const response = await this.client.searchUser({ q: username, limit: 1 });
      if (response.result && response.result.users && response.result.users.length > 0) {
        const user = response.result.users[0];
        return {
          fid: typeof user.fid === 'string' ? parseInt(user.fid) : user.fid,
          username: user.username,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error searching user ${username}:`, error);
      return null;
    }
  }

  /**
   * Get user by FID
   */
  async getUserByFid(fid: number): Promise<{ fid: number; username: string } | null> {
    try {
      // Use fetchBulkUsers (lookupUserByFid is deprecated in v2)
      const response = await this.client.fetchBulkUsers({ fids: [fid] });
      if (response.users && response.users.length > 0) {
        const user = response.users[0];
        return {
          fid: typeof user.fid === 'string' ? parseInt(user.fid) : user.fid,
          username: user.username,
        };
      }
      return null;
    } catch (error) {
      console.error(`Error getting user ${fid}:`, error);
      return null;
    }
  }

  /**
   * Fetch recent casts for a user
   */
  async getRecentCasts(fid: number, limit: number = 25): Promise<any[]> {
    try {
      const response = await this.client.fetchCastsForUser({ fid, limit });
      return response.casts || [];
    } catch (error) {
      console.error(`Error fetching casts for user ${fid}:`, error);
      return [];
    }
  }

  /**
   * Monitor user's casts for new CA mentions
   */
  async checkForNewCAs(user: MonitoredUser): Promise<DetectedToken[]> {
    const detectedTokens: DetectedToken[] = [];
    const lastChecked = this.lastCheckedTimestamps.get(user.fid) || 0;

    try {
      const casts = await this.getRecentCasts(user.fid, 50);
      
      for (const cast of casts) {
        const castTimestamp = new Date(cast.timestamp).getTime();
        
        // Only check casts newer than last check
        if (castTimestamp <= lastChecked) {
          continue;
        }

        // Extract addresses from cast text
        const text = cast.text || '';
        const addresses = this.extractAddressesFromText(text);

        for (const address of addresses) {
          detectedTokens.push({
            contractAddress: address.toLowerCase(),
            castHash: cast.hash,
            userFid: user.fid,
            timestamp: castTimestamp,
          });
        }
      }

      // Update last checked timestamp
      if (casts.length > 0) {
        const latestCast = casts[0];
        this.lastCheckedTimestamps.set(
          user.fid,
          new Date(latestCast.timestamp).getTime()
        );
      }

      return detectedTokens;
    } catch (error) {
      console.error(`Error checking CAs for user ${user.fid}:`, error);
      return detectedTokens;
    }
  }

  /**
   * Extract Ethereum addresses from text
   */
  private extractAddressesFromText(text: string): string[] {
    const addressRegex = /0x[a-fA-F0-9]{40}/g;
    const matches = text.match(addressRegex) || [];
    return matches.map(addr => addr.toLowerCase());
  }

  /**
   * Stream casts in real-time (for future use)
   */
  async streamCasts(fid: number, callback: (cast: any) => void): Promise<void> {
    // This would use Neynar's streaming API if available
    // For now, we'll use polling
    throw new Error('Streaming not implemented yet');
  }
}
