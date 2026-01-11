import axios from 'axios';

let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/';

// Ensure API_URL points to /api/
if (!API_URL.endsWith('/api/')) {
  if (API_URL.endsWith('/api')) {
    API_URL += '/';
  } else if (API_URL.endsWith('/')) {
    API_URL += 'api/';
  } else {
    API_URL += '/api/';
  }
}

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ensure baseURL ends with / if we use relative paths without /
    // Or better, don't use leading slashes in relative paths with baseURL
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response error handler
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const api = {
  auth: {
    login: (credentials) => apiClient.post('auth/login', credentials),
    register: (data) => apiClient.post('auth/register', data),
    getMe: () => apiClient.get('auth/me'),
  },
  books: {
    getAll: (params) => apiClient.get('books', { params }),
    getById: (id) => apiClient.get(`books/${id}`),
    create: (data) => apiClient.post('books', data),
    update: (id, data) => apiClient.put(`books/${id}`, data),
    delete: (id) => apiClient.delete(`books/${id}`),
    search: (q) => apiClient.get('books/search', { params: { q } }),
  },
  readers: {
    getAll: (params) => apiClient.get('readers', { params }),
    getById: (id) => apiClient.get(`readers/${id}`),
    update: (id, data) => apiClient.put(`readers/${id}`, data),
    getHistory: (id) => apiClient.get(`readers/${id}/borrow-history`),
    getMyHistory: () => apiClient.get('readers/me/history'),
  },
  borrow: {
    create: (data) => apiClient.post('borrow', data),
    returnBook: (data) => apiClient.post('borrow/return', data),
    getAll: (params) => apiClient.get('borrow/all', { params }),
    getReaderHistory: (readerId) => apiClient.get(`borrow/history/${readerId}`),
  },
  staff: {
    getAll: (params) => apiClient.get('staff', { params }),
    create: (data) => apiClient.post('staff', data),
    update: (id, data) => apiClient.put(`staff/${id}`, data),
    delete: (id) => apiClient.delete(`staff/${id}`),
  },
  reports: {
    getBorrowedStats: () => apiClient.get('reports/borrowed-books'),
    getTopReaders: (params) => apiClient.get('reports/top-readers', { params }),
  }
};

export default api;
