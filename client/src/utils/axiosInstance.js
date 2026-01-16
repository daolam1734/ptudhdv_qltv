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

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth token interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response error handler
axiosInstance.interceptors.response.use(
    (response) => response.data,
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

export default axiosInstance;
