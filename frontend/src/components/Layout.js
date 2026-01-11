import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Book, 
  Users, 
  ClipboardList, 
  BarChart3, 
  LogOut, 
  User as UserIcon,
  LayoutDashboard,
  Library
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout, isStaff, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/', roles: ['admin', 'librarian', 'staff', 'reader'] },
    { icon: <Book size={20} />, label: 'Books', path: '/books', roles: ['admin', 'librarian', 'staff', 'reader'] },
    { icon: <ClipboardList size={20} />, label: 'Borrows', path: '/borrows', roles: ['admin', 'librarian', 'staff'] },
    { icon: <ClipboardList size={20} />, label: 'My History', path: '/my-history', roles: ['reader'] },
    { icon: <Users size={20} />, label: 'Readers', path: '/readers', roles: ['admin', 'librarian', 'staff'] },
    { icon: <UserIcon size={20} />, label: 'Staff', path: '/staff', roles: ['admin'] },
    { icon: <BarChart3 size={20} />, label: 'Reports', path: '/reports', roles: ['admin', 'librarian'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(user?.role));

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="p-6 flex items-center gap-2">
          <Library size={32} />
          <h1 className="text-xl font-bold">LibManager</h1>
        </div>
        
        <nav className="flex-1 px-4 mt-4">
          {filteredMenu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                location.pathname === item.path 
                  ? 'bg-indigo-800 text-white' 
                  : 'hover:bg-indigo-600 text-indigo-100'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-indigo-600">
          <div className="flex items-center gap-3 px-4 py-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold">
              {user?.fullName?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-indigo-200 capitalize">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg hover:bg-red-600 transition-colors text-red-100"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm h-16 flex items-center px-8 justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {filteredMenu.find(m => m.path === location.pathname)?.label || 'Library System'}
          </h2>
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
