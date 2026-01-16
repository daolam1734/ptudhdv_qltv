import React, { useState, useEffect } from "react";
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  AlertCircle, 
  PlusCircle, 
  RotateCcw,
  Search,
  Book,
  UserCheck,
  Zap,
  Clock,
  ArrowRight,
  TrendingUp,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import reportService from "../../services/reportService";
import borrowService from "../../services/borrowService";
import { useAuth } from "../../context/AuthContext";

const StaffDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalReaders: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    pendingRequests: 0
  });
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Chào buổi sáng";
    if (hour < 18) return "Chào buổi chiều";
    return "Chào buổi tối";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, borrowsRes] = await Promise.all([
          reportService.getLibraryStats(),
          borrowService.getAll({ limit: 5, status: 'pending,approved,borrowed,overdue' })
        ]);
        
        const data = statsRes.data;
        setStats({
          totalBooks: data.bookStats.total,
          totalReaders: data.readerStats.totalReaders,
          activeBorrows: data.borrowStats?.activeBorrows || data.borrowStats?.active || 0,
          overdueBorrows: data.borrowStats?.overdueBorrows || data.borrowStats?.overdue || 0,
          pendingRequests: data.borrowStats?.pendingRequests || data.borrowStats?.pending || 0
        });
        setRecentBorrows(borrowsRes.data || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const statCards = [
    { label: "Yêu cầu chờ mượn", value: stats.pendingRequests, icon: <RotateCcw />, color: "bg-amber-500", lightColor: "bg-amber-50", textColor: "text-amber-600" },
    { label: "Sách đang mượn", value: stats.activeBorrows, icon: <ClipboardList />, color: "bg-blue-500", lightColor: "bg-blue-50", textColor: "text-blue-600" },
    { label: "Sách quá hạn", value: stats.overdueBorrows, icon: <AlertCircle />, color: "bg-rose-500", lightColor: "bg-rose-50", textColor: "text-rose-600" },
    { label: "Tổng số độc giả", value: stats.totalReaders, icon: <Users />, color: "bg-emerald-500", lightColor: "bg-emerald-50", textColor: "text-emerald-600" },
  ];

  const quickActions = [
    { icon: <PlusCircle size={20} />, label: "Cho mượn sách", path: "/borrows", desc: "Tạo phiếu mượn mới" },
    { icon: <RotateCcw size={20} />, label: "Tiếp nhận trả sách", path: "/borrows", desc: "Xử lý trả & vi phạm" },
    { icon: <Search size={20} />, label: "Tra cứu kho", path: "/books", desc: "Kiểm tra vị trí sách" },
    { icon: <UserCheck size={20} />, label: "Đăng ký độc giả", path: "/readers", desc: "Cấp thẻ thư viện" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-neutral-dark tracking-tight">
            {getGreeting()}, {user?.fullName || "Thủ thư"}!
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Hôm nay bạn có <span className="text-rose-600 font-bold">{stats.overdueBorrows}</span> sách quá hạn 
            {stats.pendingRequests > 0 && (
              <> và <span className="text-amber-600 font-bold">{stats.pendingRequests}</span> yêu cầu mượn</>
            )} cần xử lý.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">
           <div className="px-4 py-2 bg-primary-light/10 text-primary rounded-xl text-xs font-bold uppercase tracking-wider">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
           </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
             <div className="flex justify-between items-start mb-4">
                <div className={`${card.lightColor} ${card.textColor} p-3 rounded-2xl`}>
                   {React.cloneElement(card.icon, { size: 24 })}
                </div>
                {card.value > 0 && card.label === "Sách quá hạn" && (
                   <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                )}
             </div>
             <div>
                <p className="text-sm font-bold text-gray-500 transition-colors group-hover:text-primary">{card.label}</p>
                <div className="flex items-end gap-2 mt-1">
                   <h3 className="text-3xl font-black text-neutral-dark tabular-nums">{card.value}</h3>
                   <span className="text-xs font-bold text-gray-400 mb-1.5 uppercase">đơn vị</span>
                </div>
             </div>
             {/* Subtle Background Pattern */}
             <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`}>
                   {React.cloneElement(card.icon, { size: 100 })}
             </div>
          </div>
        ))}
      </div>

      {/* Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stats.overdueBorrows > 0 && (
          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-[2rem] p-8 text-white shadow-xl shadow-rose-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                   <AlertCircle size={24} />
                </div>
                <h4 className="text-xl font-bold">Cảnh báo Quá hạn</h4>
              </div>
              <p className="text-rose-100 text-sm leading-relaxed mb-6">
                Có <span className="font-black text-white underline">{stats.overdueBorrows} trường hợp</span> trả sách muộn. Vui lòng liên hệ độc giả và thu hồi sách ngay để tránh thất thoát.
              </p>
              <Link to="/borrows?status=overdue" className="inline-flex items-center gap-2 bg-white text-rose-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-rose-50 transition-colors">
                Xem danh sách quá hạn <ArrowRight size={18} />
              </Link>
            </div>
            <AlertCircle className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        )}

        {stats.pendingRequests > 0 && (
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-[2rem] p-8 text-white shadow-xl shadow-orange-500/20 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                   <Clock size={24} />
                </div>
                <h4 className="text-xl font-bold">Yêu cầu Đang chờ</h4>
              </div>
              <p className="text-amber-100 text-sm leading-relaxed mb-6">
                Bạn có <span className="font-black text-white underline">{stats.pendingRequests} đăng ký mượn sách</span> mới từ độc giả đang đợi được phê duyệt trong hệ thống.
              </p>
              <Link to="/borrows?status=pending" className="inline-flex items-center gap-2 bg-white text-amber-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-amber-50 transition-colors">
                Đến trang phê duyệt mượn <ArrowRight size={18} />
              </Link>
            </div>
            <Clock className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 group-hover:scale-110 transition-transform duration-700" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
             <h2 className="text-xl font-bold text-neutral-dark flex items-center gap-2">
                <Zap size={20} className="text-amber-500" /> Thao tác nhanh
             </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {quickActions.map((action, idx) => (
                <Link 
                   key={idx}
                   to={action.path}
                   className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-primary hover:shadow-lg hover:shadow-primary/5 transition-all group"
                >
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-neutral-light rounded-xl text-gray-400 group-hover:bg-primary group-hover:text-white transition-all">
                         {action.icon}
                      </div>
                      <div>
                         <p className="font-bold text-neutral-dark group-hover:text-primary transition-colors">{action.label}</p>
                         <p className="text-xs text-gray-400 font-medium">{action.desc}</p>
                      </div>
                      <ChevronRight size={16} className="ml-auto text-gray-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                   </div>
                </Link>
             ))}
          </div>

          <div className="bg-primary p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl shadow-primary/20">
             <div className="relative z-10 max-w-md">
                <h3 className="text-2xl font-bold mb-2">Lời nhắc nghiệp vụ</h3>
                <p className="text-primary-light text-sm leading-relaxed mb-6">Đừng quên kiểm tra tình trạng sách khi độc giả trả lại. Các hư hỏng nghiêm trọng cần được ghi nhận để tính phí bồi thường (50% - 150% giá trị sách).</p>
                <Link to="/borrows" className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-neutral-light transition-colors">
                   Bắt đầu xử lý trả sách <ArrowRight size={18} />
                </Link>
             </div>
             <Book className="absolute -right-12 -bottom-12 w-64 h-64 opacity-10 rotate-12" />
          </div>
        </div>

        {/* Status Tracker / Activity */}
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-neutral-dark flex items-center gap-2">
                 <Clock size={20} className="text-primary" /> Lưu thông gần đây
              </h2>
           </div>
           <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6">
              <div className="space-y-6">
                 {recentBorrows.length > 0 ? recentBorrows.map((borrow, idx) => (
                    <div key={borrow._id} className="flex gap-4">
                        <div className="relative">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                             borrow.status === 'returned' ? 'bg-emerald-50 text-emerald-500' : 
                             borrow.status === 'overdue' ? 'bg-red-50 text-red-500' : 
                             borrow.status === 'pending' ? 'bg-amber-50 text-amber-500' : 'bg-blue-50 text-blue-500'
                           }`}>
                              {borrow.status === 'returned' ? <RotateCcw size={18} /> : 
                               borrow.status === 'overdue' ? <AlertCircle size={18} /> : 
                               borrow.status === 'pending' ? <Clock size={18} /> : <PlusCircle size={18} />}
                           </div>
                           {idx < recentBorrows.length - 1 && (
                              <div className="absolute top-10 bottom-[-24px] left-1/2 w-0.5 bg-gray-50 -translate-x-1/2"></div>
                           )}
                        </div>
                        <div className="min-w-0">
                           <p className="text-sm font-bold text-neutral-dark truncate">{borrow.bookId?.title}</p>
                           <p className="text-xs text-gray-500 mt-0.5">Độc giả: {borrow.readerId?.fullName}</p>
                           <div className="flex items-center gap-2 mt-1">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                borrow.status === 'returned' ? 'text-emerald-600 bg-emerald-50' : 
                                borrow.status === 'overdue' ? 'text-red-600 bg-red-50' : 
                                borrow.status === 'pending' ? 'text-amber-600 bg-amber-50' : 
                                borrow.status === 'approved' ? 'text-blue-600 bg-blue-50' : 
                                borrow.status === 'borrowed' ? 'text-indigo-600 bg-indigo-50' :
                                borrow.status === 'cancelled' ? 'text-gray-600 bg-gray-50' : 'text-blue-600 bg-blue-50'
                              }`}>
                                {borrow.status === 'pending' ? 'Chờ duyệt' : 
                                 borrow.status === 'approved' ? 'Đã duyệt' :
                                 borrow.status === 'borrowed' ? 'Đang mượn' :
                                 borrow.status === 'overdue' ? 'Quá hạn' :
                                 borrow.status === 'returned' ? 'Đã trả' :
                                 borrow.status === 'cancelled' ? 'Đã hủy' : borrow.status}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(borrow.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                           </div>
                        </div>
                    </div>
                 )) : (
                    <div className="py-10 text-center">
                        <p className="text-gray-400 text-sm font-medium italic">Chưa có hoạt động mới</p>
                    </div>
                 )}
              </div>

              <Link to="/borrows" className="w-full mt-8 py-3 bg-neutral-light text-gray-400 rounded-xl text-xs font-bold hover:bg-gray-100 hover:text-primary transition-all flex items-center justify-center">
                 XEM TOÀN BỘ LƯU THÔNG
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboardPage;
