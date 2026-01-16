import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-neutral-light flex items-center justify-center p-2 sm:p-4 selection:bg-primary-light selection:text-primary relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
      
      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 bg-neutral-white rounded-xl shadow-sm border border-gray-100 text-gray-600 hover:text-primary hover:border-primary-light transition-all font-bold text-xs group z-50 invisible sm:visible"
      >
        <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-primary-light transition-colors">
          <Home size={14} />
        </div>
        <span>Trang chủ</span>
      </Link>

      <div className="w-full max-w-7xl mx-auto flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;

