import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BasketProvider } from './context/BasketContext';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BasketProvider>
        <Router>
          <AppRoutes />
          <Toaster position="top-right" />
        </Router>
      </BasketProvider>
    </AuthProvider>
  );
}

export default App;
