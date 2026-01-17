import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import borrowService from "../../services/borrowService";
import { useAuth } from "../../context/AuthContext";
import {
  Calendar,
  Book,
  Clock,
  History,
  TrendingUp,
  Search,
  Filter,
  ChevronRight,
  RotateCcw,
  Info,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import BorrowSlipModal from "../../components/common/BorrowSlipModal";

const ReaderHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [renewingItem, setRenewingItem] = useState(null);
  const [cancellingItem, setCancellingItem] = useState(null);
  const [selectedBorrow, setSelectedBorrow] = useState(null);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    fetchHistory();
    if (user) refreshUser();
  }, []); // Remove user from here to avoid infinite loops, but refresh once on mount

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await borrowService.getMyHistory();
      // Ensure history is an array
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (id) => {
    try {
      await borrowService.renewBorrow(id);
      setMsg({ type: "success", text: "Gia hạn thành công thêm 14 ngày!" });
      fetchHistory();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Không thể gia hạn. Vui lòng liên hệ thủ thư." });
    }
    setTimeout(() => setMsg({ type: "", text: "" }), 5000);
  };

  const handleCancel = async (id) => {
    try {
      await borrowService.cancel(id);
      setMsg({ type: "success", text: "Đã hủy yêu cầu mượn thành công!" });
      fetchHistory();
    } catch (err) {
      setMsg({ type: "error", text: err.response?.data?.message || "Không thể hủy yêu cầu. Vui lòng liên hệ thủ thư." });
    }
    setTimeout(() => setMsg({ type: "", text: "" }), 5000);
  };

  const filteredHistory = history.filter(item => {
    const matchesSearch = (item.books || []).some(b => b.bookId?.title?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item._id.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter mapping for bilingual support
    let matchesStatus = statusFilter === "all";
    if (!matchesStatus) {
      if (statusFilter === "pending") matchesStatus = ["pending", "đang chờ"].includes(item.status);
      else if (statusFilter === "approved") matchesStatus = ["approved", "đã duyệt"].includes(item.status);
      else if (statusFilter === "borrowed") matchesStatus = ["borrowed", "đang mượn"].includes(item.status);
      else if (statusFilter === "overdue") matchesStatus = ["overdue", "quá hạn"].includes(item.status);
      else if (statusFilter === "returned") matchesStatus = ["returned", "đã trả"].includes(item.status);
      else if (statusFilter === "rejected") matchesStatus = ["rejected", "từ chối"].includes(item.status);
      else matchesStatus = item.status === statusFilter;
    }
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const map = {
      pending: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Chờ duyệt" },
      approved: { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", label: "Vui lòng đến lấy sách" },
      borrowed: { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", label: "Đang mượn" },
      overdue: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", label: "Quá hạn" },
      returned: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", label: "Đã trả" },
      rejected: { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "Bị từ chối" },
      cancelled: { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", label: "Đã hủy" },
      lost: { bg: "bg-gray-900", text: "text-white", border: "border-gray-900", label: "Mất sách" },
      damaged: { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Hư hỏng nhẹ" },
      damaged_heavy: { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", label: "Hư hỏng nặng" },
      'đang chờ': { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Chờ duyệt" },
      'đã duyệt': { bg: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-100", label: "Vui lòng đến lấy sách" },
      'đang mượn': { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-100", label: "Đang mượn" },
      'quá hạn': { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", label: "Quá hạn" },
      'đã trả': { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100", label: "Đã trả" },
      'đã trả (vi phạm)': { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Đã trả (Có vi phạm)" },
      'từ chối': { bg: "bg-gray-100", text: "text-gray-500", border: "border-gray-200", label: "Bị từ chối" },
      'đã hủy': { bg: "bg-slate-100", text: "text-slate-500", border: "border-slate-200", label: "Đã hủy" },
      'làm mất': { bg: "bg-gray-900", text: "text-white", border: "border-gray-900", label: "Mất sách" },
      'hư hỏng': { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-100", label: "Hư hỏng nhẹ" },
      'hư hỏng nặng': { bg: "bg-rose-50", text: "text-rose-600", border: "border-rose-100", label: "Hư hỏng nặng" }
    };
    const style = map[status] || map.returned;
    return (
      <span className={`px-4 py-1.5 rounded-lg border ${style.bg} ${style.text} ${style.border} text-[11px] font-black uppercase tracking-tight`}>
        {style.label}
      </span>
    );
  };

  const isActive = (status) => ['borrowed', 'overdue', 'pending', 'approved', 'đang mượn', 'quá hạn', 'đang chờ', 'đã duyệt'].includes(status);
  
  const isReturned = (status) => ['returned', 'đã trả', 'đã trả (vi phạm)', 'lost', 'làm mất', 'hư hỏng', 'hư hỏng nặng'].includes(status);

  const stats = {
    total: history.length,
    active: history.filter(h => isActive(h.status)).length,
    returned: history.filter(h => h.status === 'returned' || h.status === 'đã trả' || h.status === 'đã trả (vi phạm)').length
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Violation Banner */}
      {user?.unpaidViolations > 0 && (
        <div className="bg-gradient-to-r from-rose-500 to-rose-600 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-rose-200">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-bold">Bạn đang có vi phạm chưa xử lý</h4>
              <p className="text-rose-100 font-medium text-sm">Tổng phí vi phạm: <span className="text-white font-black text-lg underline decoration-white/30">{user.unpaidViolations.toLocaleString('vi-VN')}đ</span></p>
              <p className="text-rose-200/60 text-[10px] font-bold uppercase tracking-widest">Vui lòng đến quầy thủ thư để hoàn tất nghĩa vụ</p>
            </div>
          </div>
          <div className="px-8 py-4 bg-white text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg">
            Yêu cầu hỗ trợ
          </div>
        </div>
      )}

      {/* Alert Message */}
      {msg.text && (
        <div className={`fixed top-24 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-right duration-500 border-l-[6px] ${msg.type === "success" ? "bg-white border-emerald-500 text-emerald-700" : "bg-white border-rose-500 text-rose-700"
          }`}>
          <div className={`p-2 rounded-full ${msg.type === "success" ? "bg-emerald-50" : "bg-rose-50"}`}>
            {msg.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-400 mb-0.5">{msg.type === "success" ? "Thành công" : "Thông báo lỗi"}</p>
            <p className="font-bold text-gray-900">{msg.text}</p>
          </div>
        </div>
      )}

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch sử mượn & trả</h1>
          <p className="text-gray-500 font-medium mt-1">Hành trình tri thức của bạn qua từng trang sách.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm min-w-[140px]">
            <p className="text-xs font-semibold text-gray-400 mb-2">Tổng lượt mượn</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-primary tabular-nums">{stats.total}</p>
              <p className="text-xs text-gray-400 font-medium italic"> lượt</p>
            </div>
          </div>
          <div className="bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm min-w-[140px]">
            <p className="text-xs font-semibold text-gray-400 mb-2">Hoàn tất</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-emerald-600 tabular-nums">{stats.returned}</p>
              <p className="text-xs text-gray-400 font-medium italic"> đã trả</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-3 relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm tác phẩm, mã mượn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-medium text-sm shadow-sm"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full appearance-none pl-12 pr-10 py-4 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 focus:outline-none focus:border-primary transition-all text-sm shadow-sm cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Chờ lấy sách</option>
            <option value="borrowed">Đang mượn</option>
            <option value="overdue">Quá hạn</option>
            <option value="returned">Đã trả</option>
            <option value="đã trả (vi phạm)">Đã trả (Vi phạm)</option>
            <option value="rejected">Bị từ chối</option>
          </select>
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={16} />
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-xs font-bold text-gray-400">Tác phẩm</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400">Thời gian</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 text-center">Trạng thái</th>
                <th className="px-8 py-5 text-xs font-bold text-gray-400 text-right pr-12">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="4" className="px-8 py-8 h-20 bg-gray-50/10"></td>
                  </tr>
                ))
              ) : filteredHistory.length > 0 ? (
                filteredHistory.map((item) => {
                  // Nhóm các sách trùng nhau trong cùng một phiếu mượn (và cùng trạng thái)
                  const groupedBooks = (item.books || []).reduce((acc, curr) => {
                    const existingBook = acc.find(b => 
                      (b.bookId?._id || b.bookId) === (curr.bookId?._id || curr.bookId) && 
                      b.status === curr.status
                    );
                    if (existingBook) {
                      existingBook.quantity += 1;
                    } else {
                      acc.push({ ...curr, quantity: 1 });
                    }
                    return acc;
                  }, []);

                  return (
                    <tr key={item._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-6 align-top">
                        <div className="space-y-4">
                          {groupedBooks.map((bItem, idx) => (
                             <div key={idx}>
                               <Link to={`/books/${bItem.bookId?._id}`} className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                                <div className="w-10 h-14 bg-white rounded-lg flex items-center justify-center text-gray-200 shadow-sm border border-gray-100 shrink-0 relative overflow-hidden">
                                  {bItem.bookId?.coverImage ? (
                                    <img src={bItem.bookId.coverImage} className="w-full h-full object-cover" />
                                  ) : (
                                    <Book size={18} strokeWidth={1.5} />
                                  )}
                                  {bItem.quantity > 1 && (
                                    <div className="absolute top-0 right-0 bg-primary text-white text-[9px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-sm">
                                      x{bItem.quantity}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-gray-900 text-xs truncate max-w-[200px]">{bItem.bookId?.title || "N/A"}</p>
                                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">{bItem.bookId?.author}</p>
                                    {bItem.status && bItem.status !== item.status && (
                                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 text-[8px] font-black border border-amber-100 uppercase">
                                        {bItem.status}
                                      </span>
                                    )}
                                </div>
                               </Link>
                             </div>
                          ))}
                          <p className="text-[10px] text-gray-300 font-bold mt-2 uppercase tracking-wider border-t border-gray-50 pt-2 shadow-sm w-fit">Mã: #{item._id.slice(-8).toUpperCase()}</p>
                        </div>
                      </td>
                    <td className="px-8 py-6 align-top">
                      {(['pending', 'approved', 'rejected', 'đang chờ', 'đã duyệt', 'từ chối', 'đã hủy'].includes(item.status)) ? (
                        <p className="text-[10px] font-black uppercase text-gray-300 tracking-widest italic">Đang xử lý...</p>
                      ) : (
                        <div className="space-y-1.5 min-w-[140px]">
                          <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                            <Calendar size={12} className="text-gray-300" />
                            <span>Mượn: {new Date(item.borrowDate).toLocaleDateString("vi-VN")}</span>
                          </div>
                          <div className={`flex items-center gap-2 text-[10px] font-bold uppercase ${(item.status === 'overdue' || item.status === 'quá hạn') ? 'text-rose-500' : 'text-primary'}`}>
                            <Clock size={12} />
                            <span>Hạn: {new Date(item.dueDate).toLocaleDateString("vi-VN")}</span>
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center gap-2">
                        {getStatusBadge(item.status)}
                        {item.renewalCount > 0 && (
                          <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md">
                            Đã gia hạn {item.renewalCount} lần
                          </span>
                        )}
                        <p className="text-[11px] font-black text-gray-400 mt-1">
                          Tổng số: {item.books?.length || 1} cuốn
                        </p>
                        {item.violation && item.violation.amount > 0 && (
                          <div className="flex flex-col items-center gap-0.5 animate-in fade-in slide-in-from-top-1 duration-300 group/v relative">
                             <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border shadow-sm ${item.violation.isPaid ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100 shadow-rose-50'}`}>
                                {item.violation.isPaid ? <CheckCircle2 size={10} strokeWidth={3} /> : <AlertCircle size={10} strokeWidth={3} />}
                                {item.violation.amount.toLocaleString()}đ
                             </div>
                             <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tight italic">
                                {item.violation.isPaid ? 'Đã nộp phí' : item.violation.reason}
                             </span>
                             
                             {/* Tooltip description */}
                             {item.violation.description && (
                                <div className="absolute bottom-full mb-2 hidden group-hover/v:block w-48 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl z-50 text-center leading-relaxed animate-in zoom-in duration-200">
                                   <p className="font-bold border-b border-white/10 pb-1 mb-1 text-primary italic">Chi tiết vi phạm</p>
                                   {item.violation.description}
                                   <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900"></div>
                                </div>
                             )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right pr-8 flex justify-end gap-3">
                      <button
                        onClick={() => { setSelectedBorrow(item); setShowSlipModal(true); }}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-neutral-light text-gray-500 hover:bg-primary hover:text-white rounded-2xl transition-all text-xs font-black border border-gray-100 shadow-sm active:scale-95"
                      >
                        <FileText size={16} strokeWidth={3} /> Chi tiết
                      </button>

                      {(item.status === 'borrowed' || item.status === 'đang mượn') && (
                        <button
                          onClick={() => setRenewingItem(item)}
                          disabled={item.renewalCount >= 2 || new Date() > new Date(item.dueDate)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary-dark rounded-2xl transition-all text-xs font-black shadow-xl shadow-primary/20 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                          title={item.renewalCount >= 2 ? "Gia hạn tối đa " + item.renewalCount + " lần" : new Date() > new Date(item.dueDate) ? "Sách đã quá hạn" : ""}
                        >
                          <RotateCcw size={16} strokeWidth={3} /> Gia hạn thêm
                        </button>
                      )}

                      {(item.status === 'pending' || item.status === 'đang chờ') && (
                        <button
                          onClick={() => setCancellingItem(item)}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-2xl transition-all text-xs font-black border border-rose-100 shadow-sm active:scale-95"
                        >
                          <XCircle size={16} strokeWidth={3} /> Hủy yêu cầu
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
                <tr>
                  <td colSpan="4" className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <History size={64} strokeWidth={1} />
                      <p className="text-gray-900 font-bold text-xs uppercase tracking-widest">Chưa có dữ liệu lịch sử</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gray-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-gray-200">
        <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12">
          <TrendingUp size={120} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-2 uppercase tracking-widest">
              <Info size={16} /> Thông tin cần biết
            </div>
            <h4 className="text-2xl font-bold">Quy định Trả sách & Phí quá hạn</h4>
            <p className="text-gray-400 text-sm max-w-xl font-medium leading-relaxed">Hệ thống áp dụng phí vi phạm <span className="text-white font-bold underline decoration-indigo-500">5.000đ/ngày</span> cho mỗi đầu sách quá hạn. Vui lòng thanh toán tại quầy khi trả sách để được tiếp tục sử dụng dịch vụ.</p>
          </div>
          <Link to="/books" className="px-10 py-5 bg-white text-gray-900 rounded-2xl font-bold text-sm hover:bg-indigo-50 transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0 shadow-xl">
            Khám phá kho sách <ChevronRight size={18} />
          </Link>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!renewingItem}
        onClose={() => setRenewingItem(null)}
        onConfirm={() => {
          handleRenew(renewingItem?._id);
          setRenewingItem(null);
        }}
        title="Xác nhận gia hạn"
        message={`Bạn muốn gia hạn thêm 14 ngày cho cuốn sách "${renewingItem?.bookId?.title}" không?`}
        confirmText="Gia hạn ngay"
      />

      <ConfirmModal
        isOpen={!!cancellingItem}
        onClose={() => setCancellingItem(null)}
        onConfirm={() => {
          handleCancel(cancellingItem?._id);
          setCancellingItem(null);
        }}
        title="Hủy yêu cầu mượn"
        message={`Bạn có chắc chắn muốn hủy yêu cầu mượn cuốn sách "${cancellingItem?.bookId?.title}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận hủy"
        confirmColor="bg-rose-600"
      />

      <BorrowSlipModal
        isOpen={showSlipModal}
        onClose={() => { setShowSlipModal(false); setSelectedBorrow(null); }}
        borrow={selectedBorrow}
      />
    </div>
  );
};

export default ReaderHistoryPage;

