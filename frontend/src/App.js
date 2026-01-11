import React, { useState, useEffect } from 'react';
import './App.css';
import api from './services/api';
import HealthCheck from './components/HealthCheck';
import UserList from './components/UserList';
import ItemList from './components/ItemList';

function App() {
  const [activeTab, setActiveTab] = useState('health');
  const [serverInfo, setServerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchServerInfo();
  }, []);

  const fetchServerInfo = async () => {
    try {
      setLoading(true);
      const response = await api.getRoot();
      setServerInfo(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to connect to backend server');
      console.error('Error fetching server info:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 React + Express + MongoDB</h1>
        {loading ? (
          <p className="status loading">Connecting to server...</p>
        ) : error ? (
          <p className="status error">{error}</p>
        ) : (
          <p className="status success">
            Connected to {serverInfo?.message || 'Backend API'}
          </p>
        )}
      </header>

      <nav className="nav-tabs">
        <button
          className={activeTab === 'health' ? 'active' : ''}
          onClick={() => setActiveTab('health')}
        >
          Health Check
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={activeTab === 'items' ? 'active' : ''}
          onClick={() => setActiveTab('items')}
        >
          Items
        </button>
      </nav>

      <main className="main-content">
        {activeTab === 'health' && <HealthCheck />}
        {activeTab === 'users' && <UserList />}
        {activeTab === 'items' && <ItemList />}
      </main>

      <footer className="App-footer">
        <p>Backend: Express + MongoDB Atlas | Frontend: React</p>
      </footer>
    </div>
  );
}

export default App;
