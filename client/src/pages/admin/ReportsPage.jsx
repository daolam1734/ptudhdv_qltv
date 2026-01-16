import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import reportService from "../../services/reportService";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Download,
  Calendar,
  ChevronRight,
  FileText,
  PieChart,
  Clock,
  CreditCard
} from "lucide-react";

const ReportsPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month"); // day, week, month, year
  const [topReaders, setTopReaders] = useState([]);
  const [activities, setActivities] = useState([]);
  const [borrowStats, setBorrowStats] = useState({ totalBorrowed: 0, byCategory: [] });

  useEffect(() => {
    fetchAllData();
  }, [period]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, readersRes, activitiesRes, borrowRes] = await Promise.all([
        reportService.getLibraryStats(),
        reportService.getTopReaders({ limit: 5 }),
        reportService.getRecentActivities({ limit: 6 }),
        reportService.getBorrowedStats()
      ]);
      
      setStats(statsRes.data);
      setTopReaders(readersRes.data);
      setActivities(activitiesRes.data);
      setBorrowStats(borrowRes.data);
    } catch (err) {
      console.error("Failed to fetch statistics", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (type) => {
    const map = {
      alert: "bg-rose-50 text-rose-600 border-rose-100",
      action: "bg-emerald-50 text-emerald-600 border-emerald-100",
      system: "bg-blue-50 text-blue-600 border-blue-100"
    };
    return map[type] || "bg-gray-50 text-gray-600 border-gray-100";
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
          <p className="text-gray-500 font-medium mt-1">Phân tích dữ liệu vận hành và hiệu suất thư viện.</p>
        </div>
        <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-gray-100 rounded-2xl shadow-sm">
           {['day', 'week', 'month', 'year'].map((p) => (
             <button
               key={p}
               onClick={() => setPeriod(p)}
               className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                 period === p ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-gray-400 hover:text-primary"
               }`}
             >
               {p === 'day' ? 'Hôm nay' : p === 'week' ? 'Tuần' : p === 'month' ? 'Tháng' : 'Năm'}
             </button>
           ))}
           <div className="w-px bg-gray-100 mx-2 self-stretch"></div>
           <button className="flex items-center gap-2 px-4 py-2 text-primary hover:bg-primary/5 rounded-xl text-xs font-black uppercase tracking-widest transition-all">
             <Download size={16} /> Xuất PDF
           </button>
        </div>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Tổng số đầu sách", value: stats?.bookStats?.totalBooks || 0, icon: <BookOpen size={20} className="text-blue-600" />, color: "blue", suffix: " cuốn" },
          { label: "Độc giả đăng ký", value: stats?.readerStats?.totalReaders || 0, icon: <Users size={20} className="text-emerald-600" />, color: "emerald", suffix: " người" },
          { label: "Tổng lượt mượn", value: stats?.borrowStats?.totalBorrows || 0, icon: <TrendingUp size={20} className="text-primary" />, color: "indigo", suffix: " lượt" },
          { 
            label: "Phí phạt chưa thu", 
            value: (stats?.borrowStats?.unpaidFines || 0).toLocaleString('vi-VN'), 
            icon: <CreditCard size={20} className="text-rose-600" />, 
            color: "rose", 
            suffix: " đ" 
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <div className={`w-12 h-12 bg-${stat.color}-50 rounded-2xl flex items-center justify-center mb-6`}>
              {stat.icon}
            </div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{stat.label}</p>
            <div className="flex items-baseline gap-1">
              <p className="text-3xl font-black text-gray-900 tabular-nums">{stat.value}</p>
              <span className="text-xs font-bold text-gray-400">{stat.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Statistics Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Borrowing Trends Placeholder */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h3 className="text-lg font-black text-gray-900 tracking-tight">Xu hướng mượn & trả</h3>
                   <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Dữ liệu phân tích định kỳ {period}</p>
                </div>
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                   <BarChart3 size={20} />
                </div>
             </div>
             
             {/* Simple Custom Bar Chart */}
             <div className="h-64 flex items-end justify-between gap-4 px-4">
                {[45, 60, 35, 80, 55, 90, 70, 40, 65, 50, 85, 60].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div 
                      className="w-full bg-slate-100 rounded-lg group-hover:bg-primary transition-all duration-500 relative cursor-pointer"
                      style={{ height: `${h}%` }}
                    >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                         {h} lượt
                       </div>
                    </div>
                    <span className="text-[10px] font-black text-gray-300 uppercase hidden sm:block">T{i+1}</span>
                  </div>
                ))}
             </div>
             
             <div className="flex justify-center gap-8 pt-4">
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-primary rounded-full"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lượt mượn</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="w-3 h-3 bg-slate-200 rounded-full"></div>
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lượt trả</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Top Categories */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-black text-gray-900 tracking-tight">Danh mục yêu thích</h3>
                   <PieChart size={20} className="text-gray-400" />
                </div>
                <div className="space-y-4">
                   {borrowStats.byCategory?.length > 0 ? (
                     borrowStats.byCategory.map((cat, i) => {
                       const percentage = Math.round((cat.count / borrowStats.totalBorrowed) * 100);
                       return (
                         <div key={cat._id} className="space-y-2">
                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                               <span className="text-gray-400">{cat._id || "Chưa phân loại"}</span>
                               <span className="text-primary">{percentage}%</span>
                            </div>
                            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                               <div className="h-full bg-primary" style={{ width: `${percentage}%` }}></div>
                            </div>
                         </div>
                       );
                     })
                   ) : (
                     <div className="py-10 text-center text-gray-300 font-bold text-xs uppercase tracking-widest">Chưa có dữ liệu</div>
                   )}
                </div>
            </div>

            {/* Overdue Analysis */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
               <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">Cảnh báo quá hạn</h3>
                  <Clock size={20} className="text-rose-500" />
               </div>
               <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-50" />
                        <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="12" fill="transparent" 
                           strokeDasharray={364.4}
                           strokeDashoffset={364.4 * (1 - (stats?.borrowStats?.overdueBorrows / (stats?.borrowStats?.totalBorrows || 1)))} 
                           className="text-rose-500 transition-all duration-1000" />
                     </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-rose-500">{Math.round((stats?.borrowStats?.overdueBorrows / (stats?.borrowStats?.totalBorrows || 1)) * 100)}%</span>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Tỷ lệ nợ</span>
                     </div>
                  </div>
                  <div className="mt-8 grid grid-cols-2 gap-4 w-full text-center">
                     <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Quá hạn</p>
                        <p className="text-xl font-black text-rose-500 tabular-nums">{stats?.borrowStats?.overdueBorrows || 0}</p>
                     </div>
                     <div>
                        <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Đang mượn</p>
                        <p className="text-xl font-black text-primary tabular-nums">{stats?.borrowStats?.activeBorrows || 0}</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-8">
           {/* Top Readers */}
           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-black text-gray-900 tracking-tight">Top Độc giả</h3>
                 <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp size={20} />
                 </div>
              </div>
              <div className="space-y-6">
                 {topReaders.map((reader, i) => (
                   <div key={reader._id} className="flex items-center gap-4 group">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${
                        i === 0 ? "bg-amber-100 text-amber-700 shadow-lg shadow-amber-100" : 
                        i === 1 ? "bg-slate-100 text-slate-700" : 
                        i === 2 ? "bg-orange-50 text-orange-700" : "bg-gray-50 text-gray-400"
                      }`}>
                         #{i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-black text-gray-900 truncate group-hover:text-primary transition-colors">{reader.name}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{reader.totalBorrows} lượt mượn</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                   </div>
                 ))}
                 <button onClick={() => navigate('/readers')} className="w-full py-4 mt-2 bg-gray-50 text-gray-400 hover:bg-primary/5 hover:text-primary rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Xem tất cả độc giả
                 </button>
              </div>
           </div>

           {/* Recent Log Activities */}
           <div className="bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                 <FileText size={100} />
              </div>
              <div className="relative z-10">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-black tracking-tight">Nhật ký hệ thống</h3>
                    <div className="bg-white/10 p-2 rounded-lg">
                       <Clock size={16} />
                    </div>
                 </div>
                 <div className="space-y-6">
                    {activities.map((activity) => (
                      <div key={activity.id} className="relative pl-6 border-l border-white/10 pb-1 last:pb-0">
                         <div className={`absolute -left-1 top-0 w-2 h-2 rounded-full ring-4 ring-gray-900 shadow-xl ${
                           activity.type === 'alert' ? 'bg-rose-500' : 
                           activity.type === 'system' ? 'bg-blue-400' : 'bg-primary'
                         }`}></div>
                         <div className="space-y-1">
                            <p className="text-xs font-bold leading-relaxed">
                               <span className={`${
                                 activity.type === 'alert' ? 'text-rose-400' : 
                                 activity.type === 'system' ? 'text-blue-400' : 'text-primary'
                               } font-black`}>{activity.user}</span> {activity.action}
                            </p>
                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                               {new Date(activity.time).toLocaleTimeString('vi-VN')} • {new Date(activity.time).toLocaleDateString('vi-VN')}
                            </p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;

