import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
    TrendingUp, Users, BookOpen, AlertCircle, Clock, 
    CheckCircle2, FileText, Download, Calendar, ArrowUpRight,
    ArrowDownRight, MoreVertical, Search, Filter, RefreshCcw
} from 'lucide-react';

const StaffReportsPage = () => {
    const [stats, setStats] = useState(null);
    const [borrowedStats, setBorrowedStats] = useState(null);
    const [topReaders, setTopReaders] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('7days');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const [statsRes, borrowedRes, readersRes, activitiesRes] = await Promise.all([
                reportService.getLibraryStats(),
                reportService.getBorrowedStats(),
                reportService.getTopReaders({ limit: 5 }),
                reportService.getRecentActivities({ limit: 8 })
            ]);

            setStats(statsRes.data);
            setBorrowedStats(borrowedRes.data);
            setTopReaders(readersRes.data);
            setActivities(activitiesRes.data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 space-y-6">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                    <RefreshCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
                </div>
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">Đang tổng hợp báo cáo...</p>
            </div>
        );
    }

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

    const summaryCards = [
        { 
            label: 'Tổng sách lưu thông', 
            value: stats?.bookStats?.totalBooks || 0, 
            icon: <BookOpen className="text-indigo-600" />, 
            trend: '+2.4%', 
            isUp: true,
            bg: 'bg-indigo-50'
        },
        { 
            label: 'Đang mượn', 
            value: stats?.borrowStats?.activeBorrows || 0, 
            icon: <TrendingUp className="text-emerald-600" />, 
            trend: '+12%', 
            isUp: true,
            bg: 'bg-emerald-50'
        },
        { 
            label: 'Quá hạn trả', 
            value: stats?.borrowStats?.overdueBorrows || 0, 
            icon: <AlertCircle className="text-rose-600" />, 
            trend: '-5%', 
            isUp: false,
            bg: 'bg-rose-50'
        },
        { 
            label: 'Yêu cầu chờ duyệt', 
            value: stats?.borrowStats?.pendingRequests || 0, 
            icon: <Clock className="text-amber-600" />, 
            trend: '8 yêu cầu mới', 
            isUp: true,
            bg: 'bg-amber-50'
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Báo cáo & Thống kê</h1>
                    <p className="text-slate-500 font-medium mt-1">Phân tích hoạt động vận hành và lưu thông sách</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
                        <button 
                            onClick={() => setTimeRange('7days')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${timeRange === '7days' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            7 ngày
                        </button>
                        <button 
                            onClick={() => setTimeRange('30days')}
                            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${timeRange === '30days' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            30 ngày
                        </button>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                        <Download size={16} /> Xuất PDF
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
                        <div className="relative z-10 flex items-start justify-between">
                            <div className={`${card.bg} p-4 rounded-2xl`}>
                                {React.cloneElement(card.icon, { size: 24, strokeWidth: 2.5 })}
                            </div>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black ${card.isUp ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                {card.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {card.trend}
                            </div>
                        </div>
                        <div className="mt-5 relative z-10">
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.15em]">{card.label}</p>
                            <h3 className="text-3xl font-black text-slate-900 mt-1">{card.value.toLocaleString()}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Xu hướng mượn sách</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Thống kê theo thể loại</p>
                        </div>
                        <div className="flex gap-2">
                             <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1.5"></div>
                             <span className="text-[10px] font-black text-slate-500 uppercase">Top Trending</span>
                        </div>
                    </div>
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={borrowedStats?.byCategory || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="_id" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                />
                                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Popular Books Side Table */}
                <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="text-lg font-black tracking-tight">Top Độc giả</h4>
                            <Users className="text-indigo-400" size={20} />
                        </div>
                        <div className="space-y-6">
                            {topReaders.map((reader, idx) => (
                                <div key={idx} className="flex items-center gap-4 group cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center font-black text-indigo-400 border border-white/5 transition-all group-hover:bg-indigo-500 group-hover:text-white">
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black truncate">{reader.name}</p>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reader.totalBorrows} lượt mượn</p>
                                    </div>
                                    <div className="h-1.5 w-16 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${(reader.totalBorrows / topReaders[0].totalBorrows) * 100}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] mt-8 transition-all">
                            Xem tất cả độc giả
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity Log */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Lưu thông gần đây</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Thời gian thực</p>
                        </div>
                        <button className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                            <MoreVertical size={18} className="text-slate-400" />
                        </button>
                    </div>
                    <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                        {activities.map((activity, idx) => (
                            <div key={idx} className="relative flex items-start gap-5 group">
                                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${
                                    activity.status === 'borrowed' ? 'bg-indigo-50 text-indigo-600' :
                                    activity.status === 'returned' ? 'bg-emerald-50 text-emerald-600' :
                                    activity.status === 'overdue' ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-400'
                                }`}>
                                    {activity.status === 'borrowed' ? <FileText size={18} /> :
                                     activity.status === 'returned' ? <CheckCircle2 size={18} /> :
                                     activity.status === 'overdue' ? <AlertCircle size={18} /> : <Calendar size={18} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black text-slate-900">
                                            {activity.status === 'borrowed' ? 'Phát sách mới' :
                                             activity.status === 'returned' ? 'Thu hồi sách' :
                                             activity.status === 'overdue' ? 'Phát hiện quá hạn' : 'Cập nhật trạng thái'}
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{new Date(activity.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">{activity.readerId?.fullName} <span className="text-slate-300 mx-1">•</span> {activity.bookId?.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fine Collection Stat */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Tình trạng Phí phạt</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Quản lý dòng tiền</p>
                        </div>
                        <div className="bg-rose-50 px-4 py-2 rounded-xl text-[10px] font-black text-rose-600 uppercase">
                           +{ (stats?.borrowStats?.unpaidFines || 0).toLocaleString() }đ Chờ thu
                        </div>
                    </div>
                    <div className="space-y-8 mt-10">
                        <div className="relative h-4 w-full bg-slate-50 rounded-full overflow-hidden">
                           <div className="absolute h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20" style={{ width: '65%' }}></div>
                           <div className="absolute h-full bg-rose-500 rounded-full left-[65%]" style={{ width: '35%' }}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã thu hồi</p>
                                <h5 className="text-2xl font-black text-slate-900">{(stats?.borrowStats?.totalFines - stats?.borrowStats?.unpaidFines || 0).toLocaleString()}đ</h5>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-2">
                                    <CheckCircle2 size={12} /> Tăng 15% tháng này
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-3xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cần thu thêm</p>
                                <h5 className="text-2xl font-black text-slate-900">{(stats?.borrowStats?.unpaidFines || 0).toLocaleString()}đ</h5>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 mt-2">
                                    <Clock size={12} /> Đang cập nhật 
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StaffReportsPage;