import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import borrowService from '../services/borrowService';
import {
  Book,
  Users,
  User,
  ClipboardList,
  LogOut,
  LayoutDashboard,
  Library,
  CreditCard,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Bell,
  Menu,
  Search,
  BarChart3,
  BookOpen,
  Tags,
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const StaffLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 2 minutes
    const timer = setInterval(loadNotifications, 120000);
    return () => clearInterval(timer);
  }, []);

  const loadNotifications = async () => {
    try {
      const statsRes = await borrowService.getStatistics();
      const stats = statsRes.data;
      const alerts = [];

      if (stats && stats.pending > 0) {
        alerts.push({
          id: 'pending',
          type: 'warning',
          title: 'Yêu cầu chờ duyệt',
          description: `Hiện có ${stats.pending} yêu cầu mượn sách đang chờ bạn xử lý.`,
          time: 'Cần xử lý',
          icon: <Clock size={18} className="text-amber-500" />
        });
      }

      if (stats && stats.overdue > 0) {
        alerts.push({
          id: 'overdue',
          type: 'error',
          title: 'Sách quá hạn mới',
          description: `Có thêm ${stats.overdue} lượt mượn đã chuyển sang trạng thái quá hạn.`,
          time: 'Trong ngày',
          icon: <AlertCircle size={18} className="text-rose-500" />
        });
      }

      if (alerts.length === 0) {
        alerts.push({
          id: 'status',
          type: 'success',
          title: 'Hệ thống ổn định',
          description: 'Không có yêu cầu khẩn cấp nào cần xử lý lúc này.',
          time: 'Bây giờ',
          icon: <CheckCircle2 size={18} className="text-emerald-500" />
        });
      }

      setNotifications(alerts);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Bảng điều khiển', path: '/dashboard/staff' },
    { icon: <BarChart3 size={20} />, label: 'Báo cáo thống kê', path: '/staff/reports' },
    { icon: <ClipboardList size={20} />, label: 'Quản lý mượn trả', path: '/borrows' },
    { icon: <CreditCard size={20} />, label: 'Quản lý Vi phạm', path: '/violations' },
    { icon: <Book size={20} />, label: 'Quản lý kho sách', path: '/books' },
    { icon: <Tags size={20} />, label: 'Quản lý danh mục', path: '/categories' },
    { icon: <Users size={20} />, label: 'Quản lý độc giả', path: '/readers' },
    { icon: <BookOpen size={20} />, label: 'Cổng thư viện', path: '/' },
    { icon: <User size={20} />, label: 'Thông tin cá nhân', path: '/profile' },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-80" : "w-24"} bg-white border-r border-slate-200 transition-all duration-500 ease-in-out flex flex-col z-50 shadow-sm`}>
        <div className="h-24 flex items-center px-8 shrink-0 relative overflow-hidden text-slate-900">
          <div className="flex items-center gap-4 relative z-10 transition-transform duration-300">
            <div className="bg-primary shadow-lg shadow-primary/20 p-2.5 rounded-2xl flex items-center justify-center">
              <Library size={28} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500 text-slate-900">
                <span className="font-black text-2xl tracking-tight text-slate-900 italic">iLibrary</span>
                <p className="text-[10px] font-black tracking-[0.2em] text-primary uppercase -mt-1 ml-0.5">Operation</p>
              </div>
            )}
          </div>
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
        </div>

        <nav className="flex-1 overflow-y-auto pt-6 px-4 space-y-2 scrollbar-hide">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                title={item.label}
                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20 translate-x-1"
                    : "text-slate-500 hover:bg-slate-50 hover:text-primary"
                  }`}
              >
                <span className={`${isActive ? "text-white" : "text-slate-400 group-hover:text-primary transition-colors"} shrink-0`}>
                  {React.cloneElement(item.icon, { size: 22, strokeWidth: isActive ? 2.5 : 2 })}
                </span>
                {isSidebarOpen && (
                  <span className={`text-sm tracking-tight ${isActive ? "font-black" : "font-bold"}`}>
                    {item.label}
                  </span>
                )}
                {!isSidebarOpen && isActive && (
                  <div className="absolute left-0 w-1.5 h-8 bg-primary rounded-r-full -ml-4"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-slate-100 space-y-4">
          <div className={`bg-slate-50 border border-slate-100 p-4 rounded-3xl flex items-center gap-4 ${!isSidebarOpen && "justify-center p-2"}`}>
            <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-primary font-black shrink-0 relative group">
              {user?.fullName?.charAt(0)}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            {isSidebarOpen && (
              <div className="min-w-0 flex-1 animate-in fade-in duration-500">
                <p className="text-sm font-black text-slate-900 truncate tracking-tight">{user?.fullName}</p>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-primary" />
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest">{user?.role}</p>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-50 transition-all duration-300 group ${!isSidebarOpen && "justify-center"}`}
          >
            <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
            {isSidebarOpen && <span className="text-sm font-black tracking-tight">Đăng xuất hệ thống</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-24 bg-white/80 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-10 shrink-0 sticky top-0 z-40">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="w-12 h-12 flex items-center justify-center hover:bg-slate-50 rounded-2xl text-slate-400 hover:text-primary transition-all active:scale-90"
            >
              <Menu size={26} />
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-slate-800 tracking-tight animate-in fade-in slide-in-from-left-4 duration-500">
                {menuItems.find(m => location.pathname.startsWith(m.path))?.label || "Bảng điều khiển"}
              </h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Hệ thống vận hành iLibrary</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden xl:block w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu, độc giả..."
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl relative transition-all group ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-primary hover:bg-slate-50'}`}
              >
                <Bell size={24} />
                {notifications.some(n => n.id === 'pending' || n.id === 'overdue') && (
                  <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-4 ring-rose-500/10 group-hover:scale-125 transition-transform"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)}></div>
                  <div className="absolute right-0 mt-3 w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 py-6 z-40 animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-8 mb-6 flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Thông báo</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1 tracking-widest">Trung tâm vận hành</p>
                      </div>
                      <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full">{notifications.length} tin mới</span>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto px-4 space-y-2">
                      {notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className="p-4 rounded-3xl hover:bg-slate-50 transition-all flex gap-4 items-start group cursor-pointer border border-transparent hover:border-slate-100"
                          onClick={() => {
                            if (notif.id === 'pending') navigate('/borrows?status=pending');
                            if (notif.id === 'overdue') navigate('/borrows?status=overdue');
                            setShowNotifications(false);
                          }}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${notif.type === 'error' ? 'bg-rose-50 text-rose-500 ring-4 ring-rose-500/5' :
                              notif.type === 'warning' ? 'bg-amber-50 text-amber-500 ring-4 ring-amber-500/5' :
                                'bg-emerald-50 text-emerald-500 ring-4 ring-emerald-500/5'
                            }`}>
                            {notif.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <p className="text-xs font-black text-slate-900 group-hover:text-primary transition-colors">{notif.title}</p>
                              <span className="text-[9px] text-slate-300 font-black uppercase tracking-tighter">{notif.time}</span>
                            </div>
                            <p className="text-[11px] text-slate-500 font-bold leading-relaxed">{notif.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-8 mt-6 pt-6 border-t border-slate-50">
                      <button
                        onClick={() => {
                          navigate('/borrows');
                          setShowNotifications(false);
                        }}
                        className="w-full py-4 rounded-2xl bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        Xem tất cả yêu cầu
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;

