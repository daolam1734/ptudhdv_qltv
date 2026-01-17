import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useBasket } from "../../context/BasketContext";
import borrowService from "../../services/borrowService";
import { Library, LogIn, LogOut, Menu, X, Bell, LayoutDashboard, Book, History, Search, User, Home, Heart, AlertCircle, Clock, CheckCircle2, ShoppingBag } from "lucide-react";

const Header = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { basket = [] } = useBasket();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const selectedItems = Array.isArray(basket) ? basket.filter(item => item.selected) : [];
  const basketCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated, user?.role]);

  const loadNotifications = async () => {
    const alerts = [];
    const role = user?.role?.toLowerCase();
    
    if (role === 'reader') {
      if (user?.unpaidViolations > 0) {
        alerts.push({
          id: 'violation',
          type: 'error',
          title: 'Vi phạm chưa xử lý',
          description: `Bạn còn khoản nợ ${user.unpaidViolations.toLocaleString()}đ`,
          time: 'Cần xử lý ngay',
          icon: <AlertCircle size={16} className="text-rose-500" />
        });
      }
      if (user?.status === 'suspended') {
        alerts.push({
          id: 'suspended',
          type: 'error',
          title: 'Tài khoản bị đình chỉ',
          description: 'Hạn chế quyền mượn sách',
          time: 'Liên hệ thủ thư',
          icon: <X size={16} className="text-rose-600" />
        });
      }
      if (alerts.length === 0) {
        alerts.push({
          id: 'welcome',
          type: 'info',
          title: 'Chào mừng trở lại',
          description: 'Chúc bạn có thời gian đọc sách vui vẻ',
          time: 'Hôm nay',
          icon: <CheckCircle2 size={16} className="text-emerald-500" />
        });
      }
    } else if (role === 'librarian' || role === 'admin') {
      try {
        const statsRes = await borrowService.getStatistics();
        const stats = statsRes.data;
        
        if (stats && stats.pending > 0) {
           alerts.push({
            id: 'pending-borrows',
            type: 'warning',
            title: 'Phê duyệt mượn',
            description: `Có ${stats.pending} yêu cầu đang chờ duyệt`,
            time: 'Mới cập nhật',
            icon: <Clock size={16} className="text-amber-500" />
          });
        }
        
        if (stats && stats.overdue > 0) {
          alerts.push({
            id: 'overdue-borrows',
            type: 'error',
            title: 'Sách quá hạn',
            description: `Có ${stats.overdue} sách cần thu hồi gấp`,
            time: 'Khẩn cấp',
            icon: <AlertCircle size={16} className="text-rose-500" />
          });
        }
      } catch (err) {
        console.error("Failed to load staff notifications", err);
      }
    }
    setNotifications(alerts);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const readerNavItems = [
    { label: "Trang chủ", path: "/", icon: <Home size={18} /> },
    { label: "Kho sách", path: "/books", icon: <Book size={18} /> },
    { label: "Tủ sách", path: "/reader/basket", icon: <ShoppingBag size={18} /> },
    { label: "Yêu thích", path: "/reader/favorites", icon: <Heart size={18} /> },
    { label: "Lịch sử mượn", path: "/reader/history", icon: <History size={18} /> },
  ];

  const publicNavItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Kho sách", path: "/books" },
    { label: "Tin tức", path: "#" },
  ];

  const navItems = (isAuthenticated && user?.role?.toLowerCase() === 'reader') ? readerNavItems : publicNavItems;

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
                className={`text-xs font-bold transition-colors flex items-center gap-2 relative ${
                  location.pathname === item.path 
                    ? "text-primary px-3 py-1.5 bg-primary/5 rounded-lg" 
                    : "text-gray-400 hover:text-primary"
                }`}
              >
                {item.icon}
                {item.label}
                {item.label === "Tủ sách" && basketCount > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 bg-rose-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white animate-in zoom-in duration-300">
                    {basketCount}
                  </span>
                )}
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
                {/* Notification Bell */}
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={`w-12 h-12 flex items-center justify-center rounded-2xl relative transition-all group ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-slate-50'}`}
                  >
                    <Bell size={24} />
                    {notifications.length > 0 && (
                      <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-4 ring-rose-500/10 group-hover:scale-125 transition-transform"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                      <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-6 z-20 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 mb-4 flex items-center justify-between">
                          <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest">Thông báo</h4>
                          <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full">{notifications.length} tin mới</span>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto px-4 space-y-1">
                          {notifications.length > 0 ? (
                            notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                className="p-4 rounded-3xl hover:bg-gray-50 transition-all flex gap-4 items-start group border border-transparent hover:border-gray-100 cursor-pointer"
                                onClick={() => {
                                  if (notif.id === 'violation' || notif.id === 'suspended') navigate('/profile');
                                  if (notif.id === 'pending-borrows') navigate('/borrows?status=pending');
                                  if (notif.id === 'overdue-borrows') navigate('/borrows?status=overdue');
                                  setShowNotifications(false);
                                }}
                              >
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                                  notif.type === 'error' ? 'bg-rose-50 text-rose-500' :
                                  notif.type === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-emerald-50 text-emerald-500'
                                }`}>
                                  {notif.icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                   <div className="flex justify-between items-start mb-0.5">
                                      <p className="text-xs font-black text-gray-900 group-hover:text-primary transition-colors">{notif.title}</p>
                                      <span className="text-[9px] text-gray-300 font-black uppercase tracking-tighter">{notif.time}</span>
                                   </div>
                                  <p className="text-[11px] text-gray-500 font-bold leading-relaxed line-clamp-2">{notif.description}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="py-12 text-center opacity-20">
                               <Bell size={32} className="mx-auto text-gray-400 mb-2" />
                               <p className="text-[10px] font-black uppercase tracking-widest text-gray-900">Không có thông báo mới</p>
                            </div>
                          )}
                        </div>
                        <div className="px-8 mt-4 pt-4 border-t border-gray-50">
                          <button 
                             onClick={() => {
                                if (user?.role === 'reader') navigate('/reader/history');
                                else navigate('/borrows');
                                setShowNotifications(false);
                             }}
                             className="w-full py-3.5 bg-gray-50 rounded-2xl text-[10px] font-black text-gray-400 uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                          >
                             Xem tất cả thông báo
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

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