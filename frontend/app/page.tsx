'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  fid: number;
  username?: string;
  buyAmountEth: number;
  enabled: boolean;
}

interface Status {
  enabled: boolean;
  monitoredUsers: number;
  users: User[];
}

export default function Home() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [buyAmount, setBuyAmount] = useState('0.01');
  const [adding, setAdding] = useState(false);
  const [checking, setChecking] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleAddUser = async () => {
    if (!username.trim()) return;
    setAdding(true);
    try {
      await axios.post(`${API_URL}/api/users`, {
        usernameOrFid: username.trim(),
        buyAmountEth: parseFloat(buyAmount) || 0.01,
      });
      setUsername('');
      setBuyAmount('0.01');
      await fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add user');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveUser = async (fid: number) => {
    if (!confirm('Remove this user from monitoring?')) return;
    try {
      await axios.delete(`${API_URL}/api/users/${fid}`);
      await fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to remove user');
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      await axios.post(`${API_URL}/api/check`);
      alert('Check cycle completed');
      await fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to run check');
    } finally {
      setChecking(false);
    }
  };

  const monitoredUsers = useMemo(() => status?.users ?? [], [status]);

  return (
    <div className="app-wrapper">
      <header>
        <h1 className="page-title">Sniprrr</h1>
        <p className="page-subtitle">
          Monitor Farcaster creators and auto-buy Zora Creator Coins the moment they share
          contract addresses.
        </p>
      </header>

      <section className="grid">
        <div className="panel">
          <h2>Sniper Status</h2>
          {loading ? (
            <p>Loading status...</p>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span className={`status-pill ${status?.enabled ? 'pill-active' : 'pill-inactive'}`}>
                  {status?.enabled ? 'Active' : 'Disabled'}
                </span>
                <span className="status-pill" style={{ background: 'rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                  {status?.monitoredUsers ?? 0} monitored
                </span>
              </div>
              <p style={{ color: '#cbd5f5', marginBottom: '0.75rem' }}>
                Sniprrr checks for new casts every few seconds. You can run an instant scan anytime.
              </p>
              <button className="button" onClick={handleCheck} disabled={checking}>
                {checking ? 'Running...' : 'Run instant check'}
              </button>
            </>
          )}
        </div>

        <div className="panel">
          <h2>Add Creator</h2>
          <div className="input-group">
            <label>Username or FID</label>
            <input
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. @founder or 12345"
            />
          </div>
          <div className="input-group">
            <label>Buy amount (ETH)</label>
            <input
              className="input"
              type="number"
              min="0.001"
              step="0.001"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              placeholder="0.01"
            />
          </div>
          <button className="button" onClick={handleAddUser} disabled={adding || !username.trim()}>
            {adding ? 'Adding...' : 'Add to watchlist'}
          </button>
        </div>
      </section>

      <section className="panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Watchlist</h2>
          <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            {monitoredUsers.length} creator{monitoredUsers.length === 1 ? '' : 's'}
          </span>
        </div>

        {monitoredUsers.length === 0 ? (
          <p style={{ color: '#94a3b8', marginTop: '0.5rem' }}>No creators yet. Add someone to begin sniping.</p>
        ) : (
          monitoredUsers.map((user) => (
            <div key={user.fid} className="user-card">
              <div className="user-info">
                <span className="user-name">{user.username || 'Unknown'}</span>
                <span className="user-meta">
                  FID: {user.fid} · Buy: {user.buyAmountEth} ETH
                </span>
              </div>
              <button className="button secondary" onClick={() => handleRemoveUser(user.fid)}>
                Remove
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
