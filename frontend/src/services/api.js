import axios from 'axios';

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens or logging
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth tokens here if needed
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response received
      console.error('Network Error:', error.request);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service methods
const api = {
  // Root and Health endpoints
  getRoot: () => apiClient.get('/'),
  getHealth: () => apiClient.get('/health'),

  // User endpoints
  getAllUsers: (params) => apiClient.get('/api/users', { params }),
  getUserById: (id) => apiClient.get(`/api/users/${id}`),
  createUser: (data) => apiClient.post('/api/users', data),
  updateUser: (id, data) => apiClient.put(`/api/users/${id}`, data),
  deleteUser: (id) => apiClient.delete(`/api/users/${id}`),

  // Item endpoints
  getAllItems: (params) => apiClient.get('/api/items', { params }),
  getItemById: (id) => apiClient.get(`/api/items/${id}`),
  createItem: (data) => apiClient.post('/api/items', data),
  updateItem: (id, data) => apiClient.put(`/api/items/${id}`, data),
  deleteItem: (id) => apiClient.delete(`/api/items/${id}`),
  updateItemStock: (id, quantity) => apiClient.patch(`/api/items/${id}/stock`, { quantity }),
};

export default api;
