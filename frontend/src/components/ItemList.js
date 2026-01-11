import React, { useState, useEffect } from 'react';
import api from '../services/api';

function ItemList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.getAllItems({ page: 1, limit: 20 });
      setItems(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch items');
      console.error('Error fetching items:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="loading-spinner">⏳ Loading items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <div className="error-message">
          <h3>❌ {error}</h3>
          <button className="button button-primary" onClick={fetchItems}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2>📦 Items ({items.length})</h2>
        <button className="button button-primary" onClick={fetchItems}>
          🔄 Refresh
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <h3>No items found</h3>
          <p>Create an item using the API or Postman</p>
          <pre style={{
            background: '#2d2d2d',
            color: '#f8f8f2',
            padding: '1rem',
            borderRadius: '8px',
            marginTop: '1rem',
            textAlign: 'left'
          }}>
            {`POST http://localhost:5000/api/items
{
  "title": "Laptop",
  "description": "High-performance laptop",
  "price": 999.99,
  "quantity": 5,
  "category": "electronics"
}`}
          </pre>
        </div>
      ) : (
        <div className="list-container">
          {items.map((item) => (
            <div key={item._id} className="list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
                <h3 style={{ color: '#333', margin: 0 }}>{item.title}</h3>
                <span style={{
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  color: '#667eea'
                }}>
                  ${item.price}
                </span>
              </div>

              {item.description && (
                <p style={{ color: '#666', marginBottom: '0.75rem' }}>{item.description}</p>
              )}

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{
                  background: '#e3f2fd',
                  color: '#1565c0',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  📁 {item.category}
                </span>

                <span style={{ color: '#666' }}>
                  📊 Stock: {item.quantity}
                </span>

                <span style={{
                  background: item.inStock ? '#d4edda' : '#f8d7da',
                  color: item.inStock ? '#155724' : '#721c24',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  fontSize: '0.85rem'
                }}>
                  {item.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                </span>
              </div>

              {item.tags && item.tags.length > 0 && (
                <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {item.tags.map((tag, index) => (
                    <span key={index} style={{
                      background: '#f5f5f5',
                      color: '#666',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '8px',
                      fontSize: '0.8rem'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ItemList;
