import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Library, LogIn, LogOut, Menu, X, Bell, LayoutDashboard, Book, History, Search, User, Home, Heart } from "lucide-react";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const readerNavItems = [
    { label: "Trang chủ", path: "/", icon: <Home size={18} /> },
    { label: "Kho sách", path: "/books", icon: <Book size={18} /> },
    { label: "Yêu thích", path: "/reader/favorites", icon: <Heart size={18} /> },
    { label: "Lịch sử mượn", path: "/reader/history", icon: <History size={18} /> },
    { label: "Cá nhân", path: "/profile", icon: <User size={18} /> },
  ];

  const publicNavItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Kho sách", path: "/books" },
    { label: "Tin tức", path: "#" },
  ];

  const navItems = (isAuthenticated && user?.role === 'reader') ? readerNavItems : publicNavItems;

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="bg-primary p-2 rounded-xl text-white shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300">
              <Library size={24} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-neutral-dark leading-none">iLibrary</span>
              <span className="text-[10px] font-semibold text-primary mt-0.5">Library System</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`text-xs font-bold transition-colors flex items-center gap-2 ${
                  location.pathname === item.path 
                    ? "text-primary px-3 py-1.5 bg-primary/5 rounded-lg" 
                    : "text-gray-400 hover:text-primary"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center relative group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={14} />
               <input 
                  type="text" 
                  placeholder="Tìm kiếm nhanh..." 
                  className="bg-gray-50 border border-transparent rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-2 focus:ring-primary focus:bg-white w-40 transition-all focus:w-56 outline-none font-medium"
               />
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-neutral-dark">{user?.fullName}</p>
                  <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">{user?.role === 'reader' ? 'Độc giả' : 'Cán bộ'}</p>
                </div>
                <Link to={user?.role === 'reader' ? '/' : '/dashboard'}>
                  <div className="w-10 h-10 rounded-xl bg-primary-light/20 border-2 border-white flex items-center justify-center text-primary font-bold shadow-sm hover:scale-105 transition-transform">
                    {user?.fullName?.charAt(0)}
                  </div>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 text-gray-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                  title="Đăng xuất"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-xs font-bold text-gray-500 hover:text-primary transition-colors">Đăng nhập</Link>
                <Link to="/register" className="text-xs font-bold text-white bg-primary px-6 py-3 rounded-xl hover:bg-primary/90 shadow-xl shadow-primary/10 transition-all active:scale-95">
                  Đăng ký
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-400 hover:bg-gray-50 rounded-xl"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-50 animate-in slide-in-from-top duration-300">
          <div className="px-6 py-8 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold ${
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
            {!isAuthenticated && (
              <div className="pt-4 flex flex-col gap-3">
                 <Link to="/login" className="w-full py-4 text-center font-bold text-gray-500 border border-gray-100 rounded-xl">Đăng nhập</Link>
                 <Link to="/register" className="w-full py-4 text-center font-bold text-white bg-primary rounded-xl">Đăng ký</Link>
              </div>
            )}
            {isAuthenticated && (
               <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50"
               >
                <LogOut size={18} /> Đăng xuất
               </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;