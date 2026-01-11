import React, { useState, useEffect } from 'react';
import api from '../services/api';

function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.getAllUsers({ page: 1, limit: 20 });
      setUsers(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">⏳ Loading users...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">
          <h3>❌ {error}</h3>
          <button className="button button-primary" onClick={fetchUsers}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>👥 Users ({users.length})</h2>
        <button className="button button-primary" onClick={fetchUsers}>
          🔄 Refresh
        </button>
      </div>

      {users.length === 0 ? (
        <div className="empty-state">
          <h3>No users found</h3>
          <p>Create a user using the API or Postman</p>
          <pre style={{
            background: '#2d2d2d',
            color: '#f8f8f2',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            textAlign: 'left'
          }}>
            {`POST http://localhost:5000/api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "age": 25,
  "role": "user"
}`}
          </pre>
        </div>
      ) : (
        <div className="list-container">
          {users.map((user) => (
            <div key={user._id} className="list-item">
              <h3 style={{ marginBottom: '0.5rem', color: '#333' }}>{user.name}</h3>
              <p style={{ color: '#666', marginBottom: '0.5rem' }}>📧 {user.email}</p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {user.age && <span style={{ color: '#666' }}>🎂 Age: {user.age}</span>}
                <span style={{
                  background: user.status === 'active' ? '#d4edda' : '#f8d7da',
                  color: user.status === 'active' ? '#155724' : '#721c24',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  {user.status}
                </span>
                <span style={{
                  background: '#e3f2fd',
                  color: '#1565c0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  {user.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UserList;
