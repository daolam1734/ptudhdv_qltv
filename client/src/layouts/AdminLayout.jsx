import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  Book, 
  Users, 
  User as UserIcon,
  UserPlus,
  ClipboardList, 
  BarChart3, 
  LogOut, 
  LayoutDashboard,
  Library,
  Layers,
  ShieldCheck,
  Settings,
  ChevronDown,
  ChevronRight,
  CreditCard,
  Bell,
  Menu,
  Search
} from "lucide-react";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Tổng quan hệ thống", path: "/dashboard/admin" },
    { icon: <Library size={20} />, label: "Trang chủ cổng thư viện", path: "/" },
    { icon: <UserIcon size={20} />, label: "Quản lý nhân viên", path: "/staff" },
    { icon: <Users size={20} />, label: "Quản lý độc giả", path: "/readers" },
    { icon: <ClipboardList size={20} />, label: "Giao dịch mượn trả", path: "/borrows" },
    { icon: <CreditCard size={20} />, label: "Quản lý phí phạt", path: "/fines" },
    { icon: <Book size={20} />, label: "Quản lý kho sách", path: "/books" },
    { icon: <Layers size={20} />, label: "Danh mục thể loại", path: "/categories" },
    { icon: <BarChart3 size={20} />, label: "Báo cáo & Thống kê", path: "/reports" },
    { icon: <Settings size={20} />, label: "Thông tin cá nhân", path: "/profile" },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-900">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? "w-80" : "w-24"} bg-white border-r border-slate-200 transition-all duration-500 ease-in-out flex flex-col z-50 shadow-sm`}>
        <div className="h-24 flex items-center px-8 shrink-0 relative overflow-hidden">
          <div className="flex items-center gap-4 relative z-10 transition-transform duration-300">
            <div className="bg-primary shadow-lg shadow-primary/20 p-2.5 rounded-2xl flex items-center justify-center">
              <Library size={28} className="text-white" />
            </div>
            {isSidebarOpen && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                <span className="font-black text-2xl tracking-tight text-slate-900 italic">iLibrary</span>
                <p className="text-[10px] font-black tracking-[0.2em] text-primary uppercase -mt-1 ml-0.5">Management</p>
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
                className={`group relative flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                  isActive 
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
            <h2 className="text-xl font-black text-slate-800 tracking-tight animate-in fade-in slide-in-from-left-4 duration-500">
              {menuItems.find(m => location.pathname.startsWith(m.path))?.label || "Tổng quan hệ thống"}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden xl:block w-96 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Tìm kiếm tài liệu, độc giả, lịch sử..." 
                className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-transparent rounded-[1.25rem] text-sm font-bold focus:bg-white focus:border-primary/20 focus:ring-4 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-400"
              />
            </div>
            <button className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-primary hover:bg-slate-50 rounded-2xl relative transition-all group">
              <Bell size={24} />
              <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white ring-4 ring-rose-500/10 group-hover:scale-125 transition-transform"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

