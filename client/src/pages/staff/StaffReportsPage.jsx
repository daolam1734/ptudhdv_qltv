import React, { useState, useEffect } from 'react';
import reportService from '../../services/reportService';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, BookOpen, AlertCircle, Clock,
    CheckCircle2, FileText, Download, Calendar, ArrowUpRight,
    ArrowDownRight, MoreVertical, Search, Filter, RefreshCcw,
    ChevronDown, Layers, Table, FileJson, X, ShieldAlert,
    BookMarked, History, Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const StaffReportsPage = () => {
    const [stats, setStats] = useState(null);
    const [topReaders, setTopReaders] = useState([]);
    const [activities, setActivities] = useState([]);
    const [trends, setTrends] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30days');
    const [showExportModal, setShowExportModal] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetchReports();
    }, [timeRange]);

    const downloadCSV = (data, filename) => {
        if (!data || !data.length || (data.length === 1 && !data[0])) {
            toast.error("Không có dữ liệu để xuất");
            return;
        }
        
        // Helper to flatten objects
        const flattenObject = (obj, prefix = '') => {
            if (!obj || typeof obj !== 'object') return {};
            let flat = {};
            for (let key in obj) {
                const value = obj[key];
                const newKey = prefix + key;

                if (value === null || value === undefined) {
                    flat[newKey] = '';
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    // Handle populated fields (must have name or fullName or username)
                    if (value.fullName || value.name || value.username || value.title) {
                        flat[newKey] = value.fullName || value.name || value.username || value.title;
                    } else {
                        // Regular nested object - recurse
                        const nested = flattenObject(value, `${newKey}_`);
                        flat = { ...flat, ...nested };
                    }
                } else if (Array.isArray(value)) {
                    if (key === 'books' && value.length > 0) {
                        // Special handling for borrow books array
                        flat[newKey] = value.map(b => b.bookId?.title || 'N/A').join('; ');
                    } else {
                        flat[newKey] = `[${value.length} items]`;
                    }
                } else {
                    flat[newKey] = value;
                }
            }
            return flat;
        };

        const processedData = data
            .map(item => flattenObject(item))
            .filter(item => Object.keys(item).length > 0);

        if (processedData.length === 0) {
            toast.error("Dữ liệu báo cáo trống");
            return;
        }

        // Get all unique headers from all rows
        const headersSet = new Set();
        processedData.forEach(row => {
            Object.keys(row).forEach(header => headersSet.add(header));
        });
        const headers = Array.from(headersSet);

        const csvRows = [headers.join(',')];
        
        for (const row of processedData) {
            const values = headers.map(header => {
                const val = row[header] === undefined || row[header] === null ? '' : row[header];
                // Escape quotes and remove newlines for CSV safety
                return `"${String(val).replace(/"/g, '""').replace(/\r?\n|\r/g, ' ')}"`;
            });
            csvRows.push(values.join(','));
        }
        
        const csvString = "\uFEFF" + csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExport = async (type) => {
        // Map frontend IDs to backend expected types
        const typeMap = {
            'borrowing': 'borrows',
            'inventory': 'books',
            'overdue': 'overdue',
            'violation': 'violations',
            'summary': 'summary'
        };
        const backendType = typeMap[type] || type;

        try {
            setExporting(true);
            const res = await reportService.exportReport(backendType);
            
            // Generate file
            const filename = `Bao_cao_${type}`;
            
            // If it's a summary, we might need to handle it differently 
            // but for simplicity we'll pass the data array
            const dataToExport = Array.isArray(res.data) ? res.data : [res.data];
            downloadCSV(dataToExport, filename);
            
            toast.success(`Đã xuất báo cáo "${type.toUpperCase()}" thành công!`, {
                icon: '📊'
            });
            
            setShowExportModal(false);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Không thể xuất báo cáo. Vui lòng thử lại sau.');
        } finally {
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const days = timeRange === '7days' ? 7 : 30;
            const [statsRes, readersRes, activitiesRes, trendsRes] = await Promise.all([
                reportService.getLibraryStats(),
                reportService.getTopReaders({ limit: 5 }),
                reportService.getRecentActivities({ limit: 8 }),
                reportService.getTrends(days)
            ]);

            setStats(statsRes.data);
            setTopReaders(readersRes.data);
            setActivities(activitiesRes.data);
            setTrends(trendsRes.data);
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
            label: 'Độc giả hoạt động',
            value: stats?.readerStats?.totalReaders || 0,
            icon: <Users className="text-indigo-600" />,
            trend: 'Tổng số',
            isUp: true,
            bg: 'bg-indigo-50'
        },
        {
            label: 'Sách đang mượn',
            value: stats?.borrowStats?.activeBorrows || 0,
            icon: <TrendingUp className="text-emerald-600" />,
            trend: 'Lưu thông',
            isUp: true,
            bg: 'bg-emerald-50'
        },
        {
            label: 'Quá hạn trả',
            value: stats?.borrowStats?.overdueBorrows || 0,
            icon: <AlertCircle className="text-rose-600" />,
            trend: 'Cần thu hồi',
            isUp: false,
            bg: 'bg-rose-50'
        },
        {
            label: 'Yêu cầu chờ duyệt',
            value: stats?.borrowStats?.pendingRequests || 0,
            icon: <Clock className="text-amber-600" />,
            trend: 'Đợi xử lý',
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
                    <button 
                        onClick={() => setShowExportModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                    >
                        <Download size={16} /> Xuất Báo cáo
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
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Thống kê Lưu thông</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Xu hướng mượn & trả ({timeRange})</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-indigo-500"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Mượn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                <span className="text-[10px] font-black text-slate-400 uppercase">Trả</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-80 w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBorrows" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorReturns" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="label"
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
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="borrows"
                                    name="Mượn"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorBorrows)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="returns"
                                    name="Trả"
                                    stroke="#10b981"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorReturns)"
                                />
                            </AreaChart>
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
                {/* Inventory Health Breakdown */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Tình trạng Kho sách</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Phân bổ theo trạng thái vật lý</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                            { label: 'Sẵn có', value: stats?.bookStats?.available || 0, color: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-600' },
                            { label: 'Đang mượn', value: stats?.bookStats?.borrowed || 0, color: 'bg-indigo-500', bg: 'bg-indigo-50', text: 'text-indigo-600' },
                            { label: 'Hư hỏng', value: stats?.bookStats?.damaged || 0, color: 'bg-rose-500', bg: 'bg-rose-50', text: 'text-rose-600' },
                            { label: 'Mất', value: stats?.bookStats?.lost || 0, color: 'bg-slate-500', bg: 'bg-slate-50', text: 'text-slate-600' },
                        ].map((item, idx) => (
                            <div key={idx} className={`${item.bg} p-6 rounded-3xl transition-all hover:scale-[1.02]`}>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${item.text} mb-2`}>{item.label}</p>
                                <div className="flex items-end gap-2">
                                    <h5 className={`text-2xl font-black ${item.text}`}>{item.value}</h5>
                                    <span className="text-[10px] font-bold text-slate-400 mb-1">cuốn</span>
                                </div>
                                <div className="h-1 w-full bg-black/5 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className={`h-full ${item.color}`}
                                        style={{ width: `${(item.value / (stats?.bookStats?.total || 1)) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Violation Analysis (New Widget) */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Xử lý Vi phạm</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Sách hỏng & quá hạn</p>
                        </div>
                        <div className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-[10px] font-black uppercase">
                            Tỷ lệ xử lý: {Math.round((((stats?.borrowStats?.totalViolationAmount || 0) - (stats?.borrowStats?.unpaidViolationAmount || 0)) / (stats?.borrowStats?.totalViolationAmount || 1)) * 100)}%
                        </div>
                    </div>
                    <div className="flex items-center gap-8">
                        <div className="relative w-32 h-32 flex-shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 36 36">
                                <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-100" strokeWidth="3" />
                                <circle
                                    cx="18" cy="18" r="16" fill="none"
                                    className="stroke-amber-500 transition-all duration-1000"
                                    strokeWidth="3"
                                    strokeDasharray={`${(((stats?.borrowStats?.totalViolationAmount || 0) - (stats?.borrowStats?.unpaidViolationAmount || 0)) / (stats?.borrowStats?.totalViolationAmount || 1)) * 100} 100`}
                                    strokeLinecap="round"
                                    transform="rotate(-90 18 18)"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-xl font-black text-slate-900">
                                    {(((stats?.borrowStats?.totalViolationAmount || 0) - (stats?.borrowStats?.unpaidViolationAmount || 0)) / (stats?.borrowStats?.totalViolationAmount || 1) * 100).toFixed(0)}%
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã giải quyết</p>
                                <h6 className="text-xl font-black text-emerald-600">{((stats?.borrowStats?.totalViolationAmount || 0) - (stats?.borrowStats?.unpaidViolationAmount || 0)).toLocaleString()} VNĐ</h6>
                            </div>
                            <div className="h-px bg-slate-50"></div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đang chờ xử lý</p>
                                <h6 className="text-xl font-black text-rose-600">{(stats?.borrowStats?.unpaidViolationAmount || 0).toLocaleString()} VNĐ</h6>
                            </div>
                        </div>
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
                    </div>
                    <div className="space-y-6 relative before:absolute before:left-5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-50">
                        {activities.map((activity, idx) => (
                            <div key={idx} className="relative flex items-start gap-5 group">
                                <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-110 ${activity.type === 'alert' ? 'bg-rose-50 text-rose-600' :
                                        activity.type === 'action' ? 'bg-indigo-50 text-indigo-600' :
                                            activity.type === 'system' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                                    }`}>
                                    {activity.type === 'alert' ? <AlertCircle size={18} /> :
                                        activity.type === 'action' ? <FileText size={18} /> :
                                            <Clock size={18} />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-black text-slate-900">
                                            {activity.action}
                                        </p>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {new Date(activity.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 mt-0.5">
                                        Thực hiện bởi: <span className="text-primary">{activity.user}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Violation Collection Stat */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h4 className="text-lg font-black text-slate-900 tracking-tight">Tình trạng Vi phạm</h4>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Xử lý tài chính</p>
                        </div>
                        <div className="bg-rose-50 px-4 py-2 rounded-xl text-[10px] font-black text-rose-600 uppercase">
                            +{(stats?.borrowStats?.unpaidViolationAmount || 0).toLocaleString()}đ Chờ thu
                        </div>
                    </div>
                    <div className="space-y-8 mt-10">
                        {stats?.borrowStats?.totalViolationAmount > 0 ? (
                            <>
                                <div className="relative h-4 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div
                                        className="absolute h-full bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20 transition-all duration-1000"
                                        style={{ width: `${Math.round(((stats.borrowStats.totalViolationAmount - stats.borrowStats.unpaidViolationAmount) / stats.borrowStats.totalViolationAmount) * 100)}%` }}
                                    ></div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 bg-slate-50 rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Đã thu hồi</p>
                                        <h5 className="text-2xl font-black text-slate-900">{(stats?.borrowStats?.totalViolationAmount - stats?.borrowStats?.unpaidViolationAmount || 0).toLocaleString()}đ</h5>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 mt-2">
                                            <CheckCircle2 size={12} /> {Math.round(((stats.borrowStats.totalViolationAmount - stats.borrowStats.unpaidViolationAmount) / stats.borrowStats.totalViolationAmount) * 100)}% hoàn tất
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-50 rounded-3xl">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cần thu thêm</p>
                                        <h5 className="text-2xl font-black text-slate-900">{(stats?.borrowStats?.unpaidViolationAmount || 0).toLocaleString()}đ</h5>
                                        <div className="flex items-center gap-1 text-[10px] font-bold text-rose-500 mt-2">
                                            <Clock size={12} /> {Math.round((stats.borrowStats.unpaidViolationAmount / stats.borrowStats.totalViolationAmount) * 100)}% tồn đọng
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-20 text-center space-y-4 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100">
                                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto text-slate-200">
                                    <TrendingUp size={32} />
                                </div>
                                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">Chưa có dữ liệu vi phạm</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* EXPORT CENTER MODAL */}
            {showExportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => !exporting && setShowExportModal(false)}></div>
                    <div className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">Trung tâm Xuất báo cáo</h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">Yêu cầu trích xuất dữ liệu vận hành</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowExportModal(false)}
                                className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400"
                                disabled={exporting}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { 
                                        id: 'borrowing', 
                                        title: 'Lưu thông & Mượn trả', 
                                        desc: 'Dữ liệu mượn, trả và gia hạn',
                                        icon: <History size={20} />,
                                        color: 'indigo'
                                    },
                                    { 
                                        id: 'inventory', 
                                        title: 'Báo cáo Kho sách', 
                                        desc: 'Hiện trạng, vị trí & danh mục',
                                        icon: <BookMarked size={20} />,
                                        color: 'emerald'
                                    },
                                    { 
                                        id: 'overdue', 
                                        title: 'Danh sách Quá hạn', 
                                        desc: 'Chi tiết độc giả & tài liệu trễ',
                                        icon: <Clock size={20} />,
                                        color: 'rose'
                                    },
                                    { 
                                        id: 'violation', 
                                        title: 'Xử lý Vi phạm', 
                                        desc: 'Thống kê phí phạt & bồi thường',
                                        icon: <ShieldAlert size={20} />,
                                        color: 'amber'
                                    }
                                ].map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => handleExport(item.id)}
                                        disabled={exporting}
                                        className="group relative p-6 bg-slate-50 border border-transparent rounded-[2rem] hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-500/5 transition-all text-left overflow-hidden"
                                    >
                                        <div className={`w-10 h-10 bg-${item.color}-100 text-${item.color}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            {item.icon}
                                        </div>
                                        <h4 className="text-sm font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                                        
                                        <div className="absolute top-4 right-4 text-slate-200 group-hover:text-indigo-200 transition-colors">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 bg-slate-900 rounded-2xl flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <Layers className="text-indigo-400" size={18} />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Định dạng mặc định</p>
                                        <p className="text-xs font-bold font-mono">XLSX / PDF (A4 Standard)</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-black uppercase">Ready for export</span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 bg-slate-50 flex items-center gap-3">
                            <Info size={16} className="text-slate-400 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
                                Chú ý: Dữ liệu trích xuất sẽ bao gồm thông tin cá nhân của độc giả. Vui lòng bảo mật tệp tin sau khi tải về theo quy định của thư viện.
                            </p>
                        </div>

                        {exporting && (
                            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-50 flex flex-col items-center justify-center space-y-4">
                                <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Đang xử lý dữ liệu...</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffReportsPage;