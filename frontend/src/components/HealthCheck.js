import React, { useState, useEffect } from 'react';
import api from '../services/api';

function HealthCheck() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    fetchHealthCheck();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchHealthCheck, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealthCheck = async () => {
    try {
      setLoading(true);
      const response = await api.getHealth();
      setHealthData(response.data);
      setLastChecked(new Date().toLocaleTimeString());
      setError(null);
    } catch (err) {
      setError('Failed to fetch health check data');
      console.error('Health check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  if (loading && !healthData) {
    return (
      <div className="card">
        <div className="loading-spinner">⏳ Loading health check data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">
          <h3>❌ {error}</h3>
          <p>Make sure the backend server is running on http://localhost:5000</p>
          <button className="button button-primary" onClick={fetchHealthCheck}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>🏥 Server Health Check</h2>
        <button className="button button-primary" onClick={fetchHealthCheck}>
          🔄 Refresh
        </button>
      </div>

      {lastChecked && (
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          Last checked: {lastChecked}
        </p>
      )}

      {healthData && (
        <div className="info-grid">
          <div className="info-item">
            <strong>Status</strong>
            <span>{healthData.status === 'OK' ? '✅ OK' : '❌ Error'}</span>
          </div>

          <div className="info-item">
            <strong>Environment</strong>
            <span>{healthData.environment || 'N/A'}</span>
          </div>

          <div className="info-item">
            <strong>Uptime</strong>
            <span>{formatUptime(healthData.uptime)}</span>
          </div>

          <div className="info-item">
            <strong>Database</strong>
            <span>{healthData.database === 'connected' ? '🟢 Connected' : '🔴 Disconnected'}</span>
          </div>

          <div className="info-item">
            <strong>Timestamp</strong>
            <span>{new Date(healthData.timestamp).toLocaleString()}</span>
          </div>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '1rem', color: '#333' }}>📊 Response Data:</h3>
        <pre style={{ 
          background: '#2d2d2d', 
          color: '#f8f8f2', 
          padding: '1rem', 
          borderRadius: '8px',
          overflow: 'auto',
          fontSize: '0.9rem'
        }}>
          {JSON.stringify(healthData, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export default HealthCheck;
