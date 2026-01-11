import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Dashboard = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState('books');
    const [stats, setStats] = useState(null);

    useEffect(() => {
        if (user.role !== 'reader') {
            fetchStats();
        }
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.books.getStats();
            setStats(response.data.data);
        } catch (err) {
            console.error('Failed to fetch stats');
        }
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', background: 'rgba(255,255,255,0.95)', borderRadius: '15px', minHeight: '80vh' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid #edf2f7', paddingBottom: '15px' }}>
                <div>
                    <h1 style={{ color: '#2d3748', margin: 0 }}>Library Dashboard</h1>
                    <p style={{ color: '#718096', margin: '5px 0' }}>Welcome, <strong>{user.fullName}</strong> ({user.role})</p>
                </div>
                <button
                    onClick={onLogout}
                    style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', color: '#e53e3e' }}
                >
                    Logout
                </button>
            </header>

            {user.role !== 'reader' && stats && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    {[
                        { label: 'Total Books', value: stats.totalBooks, color: '#4299e1' },
                        { label: 'Out of Stock', value: stats.outOfStock, color: '#f56565' },
                        { label: 'Categories', value: stats.categoriesCount, color: '#48bb78' },
                        { label: 'Avg Stock', value: stats.avgStock?.toFixed(1), color: '#ed8936' }
                    ].map(stat => (
                        <div key={stat.label} style={{ padding: '20px', background: 'white', borderRadius: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                            <h3 style={{ margin: 0, color: '#718096', fontSize: '14px', textTransform: 'uppercase' }}>{stat.label}</h3>
                            <p style={{ margin: '10px 0 0', color: stat.color, fontSize: '28px', fontWeight: 'bold' }}>{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}

            <nav style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => setActiveTab('books')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: activeTab === 'books' ? '#667eea' : '#edf2f7', color: activeTab === 'books' ? 'white' : '#4a5568', cursor: 'pointer' }}>Books</button>
                {user.role !== 'reader' && (
                    <>
                        <button onClick={() => setActiveTab('readers')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: activeTab === 'readers' ? '#667eea' : '#edf2f7', color: activeTab === 'readers' ? 'white' : '#4a5568', cursor: 'pointer' }}>Readers</button>
                        <button onClick={() => setActiveTab('borrows')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: activeTab === 'borrows' ? '#667eea' : '#edf2f7', color: activeTab === 'borrows' ? 'white' : '#4a5568', cursor: 'pointer' }}>Transactions</button>
                    </>
                )}
                {user.role === 'reader' && (
                    <button onClick={() => setActiveTab('history')} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: activeTab === 'history' ? '#667eea' : '#edf2f7', color: activeTab === 'history' ? 'white' : '#4a5568', cursor: 'pointer' }}>My History</button>
                )}
            </nav>

            <div style={{ background: 'white', padding: '20px', borderRadius: '10px', minHeight: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                {activeTab === 'books' && <BookList user={user} />}
                {activeTab === 'readers' && <p>Reader Management Module (Coming Soon)</p>}
                {activeTab === 'borrows' && <p>Transaction Management Module (Coming Soon)</p>}
                {activeTab === 'history' && <p>My Borrow History Module (Coming Soon)</p>}
            </div>
        </div>
    );
};

// Internal BookList component for brevity
const BookList = ({ user }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchBooks();
    }, [searchTerm]);

    const fetchBooks = async () => {
        setLoading(true);
        try {
            const response = await api.books.getAll({ search: searchTerm });
            setBooks(response.data.data);
        } catch (err) {
            console.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ margin: 0, color: '#4a5568' }}>Books Catalog</h2>
                <input
                    type="text"
                    placeholder="Search by title, author, isbn..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #e2e8f0', width: '300px' }}
                />
            </div>

            {loading ? <p>Loading books...</p> : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Title</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>Author</th>
                            <th style={{ textAlign: 'left', padding: '12px' }}>ISBN</th>
                            <th style={{ textAlign: 'center', padding: '12px' }}>Stock</th>
                            <th style={{ textAlign: 'center', padding: '12px' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book._id} style={{ borderBottom: '1px solid #edf2f7' }}>
                                <td style={{ padding: '12px' }}>
                                    <strong>{book.title}</strong>
                                    <br /><small style={{ color: '#718096' }}>{book.category}</small>
                                </td>
                                <td style={{ padding: '12px' }}>{book.author}</td>
                                <td style={{ padding: '12px' }}><code>{book.isbn}</code></td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>{book.available} / {book.total}</td>
                                <td style={{ padding: '12px', textAlign: 'center' }}>
                                    <span style={{
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        background: book.status === 'available' ? '#c6f6d5' : '#fed7d7',
                                        color: book.status === 'available' ? '#22543d' : '#822727'
                                    }}>
                                        {book.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Dashboard;
