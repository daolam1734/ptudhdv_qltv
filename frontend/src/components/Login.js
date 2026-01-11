import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ onLogin }) => {
    const [isStaff, setIsStaff] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = isStaff
                ? await api.auth.loginStaff({ username, password })
                : await api.auth.loginReader({ username, password });

            const { token, data } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user || data.staff || data.reader));

            onLogin(data.user || data.staff || data.reader);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container" style={{
            maxWidth: '400px',
            margin: '100px auto',
            padding: '30px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
            <h2 style={{ textAlign: 'center', color: '#4a5568', marginBottom: '20px' }}>
                Library Management System
            </h2>

            <div style={{ display: 'flex', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <button
                    onClick={() => setIsStaff(false)}
                    style={{ flex: 1, padding: '10px', border: 'none', background: !isStaff ? '#667eea' : 'white', color: !isStaff ? 'white' : '#718096', cursor: 'pointer' }}
                >
                    Reader
                </button>
                <button
                    onClick={() => setIsStaff(true)}
                    style={{ flex: 1, padding: '10px', border: 'none', background: isStaff ? '#667eea' : 'white', color: isStaff ? 'white' : '#718096', cursor: 'pointer' }}
                >
                    Staff / Admin
                </button>
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        required
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', color: '#4a5568' }}>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                        required
                    />
                </div>

                {error && <p style={{ color: '#e53e3e', marginBottom: '15px', fontSize: '14px' }}>{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: '#764ba2',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Logging in...' : `Login as ${isStaff ? 'Staff' : 'Reader'}`}
                </button>
            </form>
        </div>
    );
};

export default Login;
