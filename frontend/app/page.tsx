'use client';

import { useState, useEffect } from 'react';
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

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/status`);
      setStatus(response.data);
    } catch (error) {
      console.error('Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
      alert('Check cycle completed!');
      await fetchStatus();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to run check');
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: '2rem', fontSize: '2rem' }}>
        🚀 Farcaster Creator Coin Sniper
      </h1>

      {/* Status Card */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Status</h2>
        <p>
          <strong>Sniper:</strong>{' '}
          <span style={{ color: status?.enabled ? '#10b981' : '#ef4444' }}>
            {status?.enabled ? '✅ Enabled' : '❌ Disabled'}
          </span>
        </p>
        <p>
          <strong>Monitored Users:</strong> {status?.monitoredUsers || 0}
        </p>
        <button
          className="button"
          onClick={handleCheck}
          disabled={checking}
          style={{ marginTop: '1rem' }}
        >
          {checking ? 'Checking...' : '🔍 Run Check Now'}
        </button>
      </div>

      {/* Add User Card */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Add User to Monitor</h2>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Username or FID</label>
          <input
            className="input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g., vitalik or 12345"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label className="label">Buy Amount (ETH)</label>
          <input
            className="input"
            type="number"
            step="0.001"
            value={buyAmount}
            onChange={(e) => setBuyAmount(e.target.value)}
            placeholder="0.01"
          />
        </div>
        <button
          className="button"
          onClick={handleAddUser}
          disabled={adding || !username.trim()}
        >
          {adding ? 'Adding...' : '➕ Add User'}
        </button>
      </div>

      {/* Monitored Users List */}
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Monitored Users</h2>
        {status?.users && status.users.length > 0 ? (
          <div>
            {status.users.map((user) => (
              <div
                key={user.fid}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#0a0a0a',
                  borderRadius: '6px',
                  marginBottom: '0.5rem',
                }}
              >
                <div>
                  <p>
                    <strong>{user.username || 'Unknown'}</strong> (FID: {user.fid})
                  </p>
                  <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
                    Buy Amount: {user.buyAmountEth} ETH
                  </p>
                </div>
                <button
                  className="button"
                  onClick={() => handleRemoveUser(user.fid)}
                  style={{ background: '#ef4444' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: '#9ca3af' }}>No users being monitored</p>
        )}
      </div>
    </div>
  );
}
