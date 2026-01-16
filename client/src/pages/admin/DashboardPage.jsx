import React, { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  ClipboardList,
  AlertCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  Book,
  UserCheck,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Search,
  BookPlus,
  UserPlus,
  ArrowUpRight,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalReaders: 0,
    activeBorrows: 0,
    overdueBorrows: 0,
    pendingRequests: 0
  });
  const [topReaders, setTopReaders] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, topReadersRes, activitiesRes] = await Promise.all([
          reportService.getLibraryStats(),
          reportService.getTopReaders({ limit: 5 }),
          reportService.getRecentActivities({ limit: 6 })
        ]);

        const data = statsRes.data;
        setStats({
          totalBooks: data.bookStats.total,
          totalReaders: data.readerStats.totalReaders,
          activeBorrows: data.borrowStats.activeBorrows,
          overdueBorrows: data.borrowStats.overdueBorrows,
          pendingRequests: data.borrowStats.pendingRequests || 0
        });

        setTopReaders(topReadersRes.data);
        setRecentActivities(activitiesRes.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper to format real dates from activities
  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const quickActions = [
    { label: "Cấp mượn", icon: <ClipboardList size={20} />, path: "/borrows", color: "bg-blue-600" },
    { label: "Thêm sách", icon: <BookPlus size={20} />, path: "/books", color: "bg-emerald-600" },
    { label: "Độc giả mới", icon: <UserPlus size={20} />, path: "/readers", color: "bg-orange-600" },
    { label: "Báo cáo", icon: <TrendingUp size={20} />, path: "/reports", color: "bg-purple-600" },
  ];

  const mainStats = [
    { label: "Tổng số sách", value: stats.totalBooks, icon: <Book size={24} />, trend: "+2.5% tháng này", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Độc giả", value: stats.totalReaders, icon: <Users size={24} />, trend: "+12 thành viên", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Đang mượn", value: stats.activeBorrows, icon: <ClipboardList size={24} />, trend: "82% hiệu suất", color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Cần duyệt", value: stats.pendingRequests, icon: <Clock size={24} />, trend: "Ưu tiên cao", color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Thống kê Tổng quan</h1>
          <p className="text-gray-500 font-medium text-sm mt-1">Chào mừng bạn trở lại! Dưới đây là tình hình thư viện hôm nay.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all active:scale-95"
            >
              <span className={`p-1.5 rounded-lg text-white ${action.color}`}>{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {mainStats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${stat.bg} rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative">
              <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-3xl font-black text-gray-900">{stat.value}</h3>
              </div>
              <div className={`flex items-center gap-1 mt-3 text-[11px] font-bold ${stat.color}`}>
                <TrendingUp size={12} /> {stat.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Management & Alerts */}
        <div className="lg:col-span-2 space-y-8">

          {/* Alerts Section */}
          <div className="space-y-4">
            {stats.overdueBorrows > 0 && (
              <div className="bg-gradient-to-r from-rose-500 to-red-600 rounded-3xl p-6 text-white shadow-xl shadow-red-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute left-0 bottom-0 opacity-10">
                  <AlertCircle size={120} />
                </div>
                <div className="relative">
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <AlertCircle size={24} />
                    Cảnh báo Quá hạn
                  </h4>
                  <p className="text-white/80 text-sm mt-1 font-medium italic">
                    Hiện đang có <span className="text-white font-black underline">{stats.overdueBorrows} cuốn sách</span> đã quá hạn trả.
                  </p>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => navigate('/borrows?status=overdue')}
                      className="px-4 py-2 bg-white text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-50 transition-colors"
                    >
                      Xử lý vi phạm ngay
                    </button>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <span className="text-2xl font-black">{stats.overdueBorrows}</span>
                  </div>
                </div>
              </div>
            )}

            {stats.pendingRequests > 0 && (
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-orange-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden relative">
                <div className="absolute left-0 bottom-0 opacity-10">
                  <Clock size={120} />
                </div>
                <div className="relative">
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <Clock size={24} />
                    Yêu cầu Chờ duyệt
                  </h4>
                  <p className="text-white/80 text-sm mt-1 font-medium italic">
                    Có <span className="text-white font-black underline">{stats.pendingRequests} lượt mượn</span> đang chờ bạn phê duyệt.
                  </p>
                  <div className="flex gap-4 mt-6">
                    <button
                      onClick={() => navigate('/borrows?status=pending')}
                      className="px-4 py-2 bg-white text-orange-600 rounded-xl font-bold text-xs hover:bg-orange-50 transition-colors"
                    >
                      Phê duyệt ngay
                    </button>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center">
                    <span className="text-2xl font-black">{stats.pendingRequests}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity Timeline */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                <Clock className="text-primary" size={20} />
                Hoạt động Hệ thống
              </h3>
              <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                Xem tất cả <ArrowRight size={14} />
              </button>
            </div>
            <div className="p-2">
              {recentActivities.map((activity, i) => (
                <div key={activity.id} className="group p-6 flex gap-6 hover:bg-gray-50 rounded-2xl transition-all cursor-pointer">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${activity.type === 'system' ? 'bg-blue-50 text-blue-600' :
                      activity.type === 'alert' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                    {activity.type === 'system' ? <Clock size={20} /> : activity.type === 'alert' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h5 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{activity.user}</h5>
                      <span className="text-[10px] font-black text-gray-400 bg-gray-100 px-2 py-0.5 rounded uppercase">{formatTime(activity.time)}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-medium">{activity.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Analytics & Top Readers */}
        <div className="space-y-8">

          {/* Top Readers Card */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden h-full flex flex-col">
            <div className="px-8 py-6 border-b border-gray-50">
              <h3 className="text-lg font-black text-gray-900 flex items-center gap-3">
                <TrendingUp className="text-emerald-500" size={20} />
                Độc giả Tích cực
              </h3>
            </div>
            <div className="p-4 flex-1">
              <div className="space-y-3">
                {topReaders.map((reader, i) => (
                  <div key={i} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group hover:bg-primary-light/5 transition-colors border border-transparent hover:border-primary/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center font-black text-primary text-sm shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                        #{i + 1}
                      </div>
                      <div>
                        <p className="text-sm font-black text-gray-900">{reader.name}</p>
                        <p className="text-[10px] font-bold text-gray-400 truncate max-w-[120px]">{reader.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-gray-900">{reader.totalBorrows}</p>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Lượt mượn</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-gray-900 rounded-2xl p-6 text-white relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 rotate-12">
                  <BookOpen size={100} />
                </div>
                <h5 className="text-sm font-bold text-primary-light mb-2">Tư duy Quản trị</h5>
                <p className="text-xs text-gray-400 leading-relaxed italic pr-2">
                  "Sự tích cực của độc giả là chỉ số quan trọng nhất đánh giá hiệu quả hoạt động của thư viện."
                </p>
                <div className="mt-4 flex justify-between items-center border-t border-white/10 pt-4">
                  <span className="text-[10px] font-black text-gray-500 uppercase">Tỷ lệ tăng trưởng</span>
                  <span className="text-xs font-black text-emerald-400 flex items-center gap-1">
                    <ArrowUpRight size={14} /> 12.5%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


