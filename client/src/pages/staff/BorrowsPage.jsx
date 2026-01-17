import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import borrowService from "../../services/borrowService";
import {
  Search,
  RotateCcw,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  Info,
  Calendar,
  User,
  BookOpen,
  ChevronRight,
  Filter,
  MoreVertical,
  CheckCircle2,
  ArrowUpRight,
  Zap,
  MoreHorizontal,
  FileText,
  Trash2,
  X,
  AlertCircle,
  ShieldCheck,
  CreditCard
} from "lucide-react";
import ConfirmModal from "../../components/common/ConfirmModal";
import BorrowSlipModal from "../../components/common/BorrowSlipModal";

const BorrowsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [activeTab, setActiveTab] = useState("all");

  // Modals state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [returnResult, setReturnResult] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Custom confirmation state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { },
    confirmText: "Xác nhận",
    type: "info" // 'info', 'danger', 'success'
  });

  const [returnData, setReturnData] = useState({
    status: "đã trả",
    notes: "",
    hasViolation: false,
    violationAmount: 0,
    violationReason: "",
    books: []
  });

  useEffect(() => {
    if (selectedRecord && showReturnModal) {
      // Tự động tính phí quá hạn
      const now = new Date();
      const dueDate = new Date(selectedRecord.dueDate);
      let overdueFee = 0;
      
      if (now > dueDate) {
        const diffDays = Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24));
        overdueFee = diffDays * 5000;
      }

      setReturnData({
        status: overdueFee > 0 ? "đã trả (vi phạm)" : "đã trả",
        notes: "",
        hasViolation: overdueFee > 0,
        violationAmount: overdueFee,
        violationReason: overdueFee > 0 ? "Phí quá hạn" : "",
        books: (selectedRecord.books || []).map(b => ({
          bookId: b.bookId?._id || b.bookId,
          title: b.bookId?.title,
          status: overdueFee > 0 ? "đã trả (vi phạm)" : "đã trả",
          violationAmount: 0,
          reason: ""
        }))
      });
    }
  }, [selectedRecord, showReturnModal]);

  useEffect(() => {
    fetchRecords();
  }, [page, search, activeTab]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search };

      if (activeTab === "returned" || activeTab === "da_tra") {
        params.status = "returned,damaged,damaged_heavy,lost,đã trả,đã trả (vi phạm),hư hỏng,hư hỏng nặng,làm mất";
      } else if (activeTab === "pending") {
        params.status = "pending,đang chờ";
      } else if (activeTab === "approved") {
        params.status = "approved,đã duyệt";
      } else if (activeTab === "borrowed") {
        params.status = "borrowed,đang mượn";
      } else if (activeTab === "overdue") {
        params.status = "overdue,quá hạn";
      } else if (activeTab !== "all") {
        params.status = activeTab;
      }

      const res = await borrowService.getAll(params);
      setRecords(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch records", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id, count) => {
    setConfirmModal({
      isOpen: true,
      title: "Duyệt yêu cầu mượn",
      message: `Hệ thống sẽ xác nhận và giữ ${count} tài liệu cho độc giả. Bạn có chắc chắn muốn duyệt yêu cầu này?`,
      confirmText: "Duyệt ngay",
      onConfirm: async () => {
        try {
          await borrowService.approve(id);
          toast.success('Đã duyệt yêu cầu! Sách hiện đang ở trạng thái chờ độc giả đến lấy.');
          fetchRecords();
        } catch (err) {
          toast.error(err.response?.data?.message || "Duyệt thất bại");
        }
      }
    });
  };

  const handleIssue = async (id, count) => {
    setConfirmModal({
      isOpen: true,
      title: "Phát sách cho độc giả",
      message: `Xác nhận độc giả đã đến nhận ${count} tài liệu. Thời hạn 14 ngày sẽ bắt đầu tính từ hôm nay.`,
      confirmText: "Phát sách ngay",
      type: "success",
      onConfirm: async () => {
        try {
          await borrowService.issue(id);
          toast.success('Đã phát sách cho độc giả thành công!');
          fetchRecords();
        } catch (err) {
          toast.error(err.response?.data?.message || "Phát sách thất bại");
        }
      }
    });
  };

  const handleReject = async (id, count, status) => {
    setConfirmModal({
      isOpen: true,
      title: status === 'approved' || status === 'đã duyệt' ? "Hủy yêu cầu đã duyệt" : "Từ chối yêu cầu",
      message: status === 'approved' || status === 'đã duyệt'
        ? `Bạn có chắc chắn muốn hủy yêu cầu mượn ${count} tài liệu? Sách sẽ được hoàn trả vào kho.`
        : `Bạn có chắc chắn muốn từ chối yêu cầu mượn ${count} tài liệu này?`,
      confirmText: status === 'approved' || status === 'đã duyệt' ? "Hủy yêu cầu" : "Từ chối",
      type: "danger",
      onConfirm: async () => {
        try {
          await borrowService.reject(id);
          toast.success('Đã xử lý từ chối/hủy yêu cầu', { icon: '🚫' });
          fetchRecords();
        } catch (err) {
          toast.error(err.response?.data?.message || "Xử lý thất bại");
        }
      }
    });
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      // violationAmount ở đây chỉ gửi phần "Phí quá hạn/Ghi chú chung" 
      // Server sẽ tự tính toán tổng dựa trên books + violationAmount gửi lên
      const res = await borrowService.returnBook(selectedRecord._id, returnData);

      // Save result and show result modal
      setReturnResult(res.data);
      setShowReturnModal(false);
      setShowResultModal(true);

      setSelectedRecord(null);
      setReturnData({
        status: "đã trả",
        notes: "",
        hasViolation: false,
        violationAmount: 0,
        violationReason: "",
        books: []
      });

      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xử lý trả sách");
    }
  };

  const handleRenew = async (id, count) => {
    setConfirmModal({
      isOpen: true,
      title: "Gia hạn đợt mượn",
      message: `Gia hạn thêm 14 ngày cho tất cả ${count} tài liệu trong đợt mượn này?`,
      confirmText: "Gia hạn ngay",
      onConfirm: async () => {
        try {
          const res = await borrowService.renewBorrow(id);
          toast.success(res.message || 'Gia hạn thành công!');
          fetchRecords();
        } catch (err) {
          toast.error(err.response?.data?.message || "Gia hạn thất bại");
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-amber-50 text-amber-600 border-amber-100",
      approved: "bg-indigo-50 text-indigo-600 border-indigo-100",
      borrowed: "bg-blue-50 text-blue-600 border-blue-100",
      returned: "bg-emerald-50 text-emerald-600 border-emerald-100",
      overdue: "bg-rose-50 text-rose-600 border-rose-100",
      lost: "bg-gray-100 text-gray-600 border-gray-200",
      damaged: "bg-orange-50 text-orange-600 border-orange-100",
      damaged_heavy: "bg-red-50 text-red-600 border-red-100",
      rejected: "bg-slate-100 text-slate-500 border-slate-200",
      cancelled: "bg-gray-50 text-gray-500 border-gray-100",
      'đang chờ': "bg-amber-50 text-amber-600 border-amber-100",
      'đã duyệt': "bg-indigo-50 text-indigo-600 border-indigo-100",
      'đang mượn': "bg-blue-50 text-blue-600 border-blue-100",
      'đã trả': "bg-emerald-50 text-emerald-600 border-emerald-100",
      'đã trả (vi phạm)': "bg-amber-50 text-amber-600 border-amber-100",
      'quá hạn': "bg-rose-50 text-rose-600 border-rose-100",
      'làm mất': "bg-gray-100 text-gray-600 border-gray-200",
      'hư hỏng': "bg-orange-50 text-orange-600 border-orange-100",
      'hư hỏng nặng': "bg-red-50 text-red-600 border-red-100",
      'từ chối': "bg-slate-100 text-slate-500 border-slate-200",
      'đã hủy': "bg-gray-50 text-gray-500 border-gray-100"
    };
    const labels = {
      pending: "Chờ duyệt",
      approved: "Chờ lấy sách",
      borrowed: "Đang mượn",
      returned: "Đã trả",
      overdue: "Quá hạn",
      lost: "Mất sách",
      damaged: "Hư hỏng nhẹ",
      damaged_heavy: "Hư hỏng nặng",
      rejected: "Đã hủy/Từ chối",
      cancelled: "Đã hủy",
      'đang chờ': "Chờ duyệt",
      'đã duyệt': "Chờ lấy sách",
      'đang mượn': "Đang mượn",
      'đã trả': "Đã trả",
      'đã trả (vi phạm)': "Đã trả (Có vi phạm)",
      'quá hạn': "Quá hạn",
      'làm mất': "Mất sách",
      'hư hỏng': "Hư hỏng nhẹ",
      'hư hỏng nặng': "Hư hỏng nặng",
      'từ chối': "Từ chối",
      'đã hủy': "Đã hủy"
    };
    return (
      <span className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-black border ${styles[status] || styles.borrowed}`}>
        {labels[status] || status}
      </span>
    );
  };

  if (loading && page === 1 && !search) return (
    <div className="flex flex-col items-center justify-center py-40 space-y-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
        <RotateCcw className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary" size={24} />
      </div>
      <p className="text-gray-400 font-bold text-xs uppercase">Đang truy xuất dữ liệu lưu thông...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Mượn/Trả</h1>
          <p className="text-gray-500 font-medium mt-1">Theo dõi hoạt động mượn sách và thời hạn trả tài liệu</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right sm:block px-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tổng lượt mượn</p>
            <p className="text-2xl font-bold text-primary">{pagination.total || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-white rounded-xl px-2">
        {[
          { id: 'all', label: 'Tất cả' },
          { id: 'pending', label: 'Chờ duyệt' },
          { id: 'approved', label: 'Chờ lấy sách' },
          { id: 'borrowed', label: 'Đang mượn' },
          { id: 'overdue', label: 'Quá hạn' },
          { id: 'returned', label: 'Lịch sử trả' }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap ${isActive ? "text-primary" : "text-gray-400 hover:text-gray-600"
                }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input
            type="text"
            placeholder="Tìm tên độc giả, tiêu đề sách hoặc mã lượt mượn..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all">
            <Filter size={16} /> Lọc trạng thái
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Độc giả & Tài liệu</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin thời gian</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => {
                const isOverdue = (record.status === 'overdue' || record.status === 'quá hạn' || 
                                  ((record.status === 'borrowed' || record.status === 'đang mượn') && new Date(record.dueDate) < new Date()));
                const displayStatus = isOverdue ? 'overdue' : record.status;

                return (
                <tr key={record._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-3">
                         <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                          <User size={14} className="text-primary" />
                          <span className="text-sm font-black text-gray-900 truncate max-w-[200px]">{record.readerId?.fullName}</span>
                        </div>
                        <div className="space-y-2">
                             {(() => {
                               // Nhóm các sách trùng nhau
                               const grouped = (record.books || []).reduce((acc, curr) => {
                                 const exists = acc.find(b => b.bookId?._id === curr.bookId?._id);
                                 if (exists) exists.quantity += 1;
                                 else acc.push({ ...curr, quantity: 1 });
                                 return acc;
                               }, []);

                               return grouped.map((bItem, idx) => (
                                 <div key={idx} className="flex items-center gap-3 bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                                   <div className="w-8 h-10 shrink-0 relative overflow-hidden rounded shadow-sm border border-white">
                                     <img
                                       src={bItem.bookId?.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200"}
                                       className="w-full h-full object-cover"
                                       alt=""
                                     />
                                     {bItem.quantity > 1 && (
                                       <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-1 py-0.5 rounded-bl shadow-sm">
                                         x{bItem.quantity}
                                       </div>
                                     )}
                                   </div>
                                   <div className="min-w-0">
                                     <p className="text-[11px] font-bold text-gray-700 truncate max-w-[170px]" title={bItem.bookId?.title}>{bItem.bookId?.title}</p>
                                     <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{bItem.bookId?.isbn}</p>
                                   </div>
                                 </div>
                               ));
                             })()}
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-1">Ngày mượn</p>
                        <p className="text-xs font-semibold text-gray-700">
                          {(['pending', 'approved', 'rejected', 'đang chờ', 'đã duyệt', 'từ chối', 'đã hủy'].includes(record.status))
                            ? '---'
                            : new Date(record.borrowDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-1">Hạn trả</p>
                        <p className={`text-xs font-bold ${isOverdue ? 'text-rose-500' : 'text-primary'}`}>
                          {(['pending', 'approved', 'rejected', 'đang chờ', 'đã duyệt', 'từ chối', 'đã hủy'].includes(record.status))
                            ? '---'
                            : new Date(record.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {getStatusBadge(displayStatus)}
                      {record.renewalCount > 0 && (
                        <span className="text-[10px] font-black text-primary bg-primary/5 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Clock size={10} strokeWidth={3} /> Đã gia hạn {record.renewalCount} lần
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 text-nowrap">
                      <button
                        onClick={() => { setSelectedRecord(record); setShowSlipModal(true); }}
                        className="p-2.5 bg-neutral-light text-gray-500 rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                        title="Xem chi tiết phiếu mượn"
                      >
                        <FileText size={18} />
                      </button>

                      {(record.status === 'pending' || record.status === 'đang chờ') && (
                        <>
                          <button
                            onClick={() => handleApprove(record._id, record.books?.length || 1)}
                            className="px-3 py-2 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs"
                            title="Chấp nhận yêu cầu"
                          >
                            <CheckCircle size={16} /> Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(record._id, record.books?.length || 1, 'pending')}
                            className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Từ chối yêu cầu"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                      {(record.status === 'approved' || record.status === 'đã duyệt') && (
                        <>
                          <button
                            onClick={() => handleIssue(record._id, record.books?.length || 1)}
                            className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs"
                            title="Phát sách cho độc giả"
                          >
                            <Zap size={16} /> Phát sách
                          </button>
                          <button
                            onClick={() => handleReject(record._id, record.books?.length || 1, 'approved')}
                            className="p-2.5 bg-red-50 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                            title="Hủy yêu cầu"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                      {(['borrowed', 'overdue', 'đang mượn', 'quá hạn'].includes(record.status)) && (
                        <>
                          <button
                            onClick={() => { setSelectedRecord(record); setShowReturnModal(true); }}
                            className="px-3 py-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-1.5 font-bold text-xs"
                            title="Xử lý trả sách"
                          >
                            <RotateCcw size={16} /> Thu hồi
                          </button>
                          <button
                            onClick={() => handleRenew(record._id, record.books?.length || 1)}
                            disabled={record.renewalCount >= 2 || new Date() > new Date(record.dueDate)}
                            className="p-2.5 bg-primary/5 text-primary rounded-xl hover:bg-primary hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={record.renewalCount >= 2
                              ? "Gia hạn tối đa " + record.renewalCount + " lần"
                              : new Date() > new Date(record.dueDate)
                                ? "Không thể gia hạn sách đã quá hạn"
                                : "Gia hạn (14 ngày)"}
                          >
                            <Clock size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center pt-8">
        <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 items-center">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-primary hover:text-white disabled:opacity-30 transition-all font-bold"
          >
            <ChevronRight className="rotate-180" size={18} />
          </button>

          <div className="flex gap-1">
            {[...Array(pagination.totalPages)].map((_, i) => {
              const pageNum = i + 1;
              if (pageNum === page || pageNum === 1 || pageNum === pagination.totalPages || (pageNum >= page - 1 && pageNum <= page + 1)) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === pageNum ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-transparent text-gray-500 hover:bg-gray-50"}`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (pageNum === page - 2 || pageNum === page + 2) {
                return <span key={pageNum} className="w-10 h-10 flex items-center justify-center text-gray-400">...</span>;
              }
              return null;
            })}
          </div>

          <button
            disabled={page === pagination.totalPages}
            onClick={() => setPage(p => p + 1)}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-primary hover:text-white disabled:opacity-30 transition-all font-bold"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* RETURN MODAL - REDESIGNED */}
      {showReturnModal && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md transition-opacity" onClick={() => setShowReturnModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-8 bg-gradient-to-br from-white to-gray-50 border-b border-gray-100 shrink-0">
               <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:scale-105">
                      <RotateCcw size={28} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-gray-900 tracking-tight">Thu hồi Tài liệu</h4>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Xác nhận tình trạng & Xử lý lưu thông</p>
                    </div>
                  </div>
                  <button onClick={() => setShowReturnModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                    <X size={20} />
                  </button>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Độc giả</p>
                    <p className="text-sm font-black text-gray-800">{selectedRecord.readerId?.fullName}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Mã phiên mượn</p>
                    <p className="text-sm font-mono font-bold text-primary">{selectedRecord.borrowSessionId?.split('-').slice(0, 2).join('-')}</p>
                  </div>
               </div>
            </div>

            {/* Modal Content - Scrollable */}
            <form onSubmit={handleReturnSubmit} className="flex-1 overflow-y-auto no-scrollbar p-8 space-y-8">
              {/* Individual Books Assessment */}
              <div className="space-y-4">
                <label className="text-[11px] font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                   <BookOpen size={14} /> Kiểm tra danh sách tài liệu
                </label>
                <div className="space-y-3">
                  {returnData.books.map((b, idx) => (
                    <div key={idx} className="group bg-white rounded-3xl border border-gray-100 p-5 hover:border-primary/30 transition-all hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 shrink-0">
                          <img 
                            src={selectedRecord.books?.[idx]?.bookId?.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200"} 
                            className="w-full h-full object-cover" 
                            alt="" 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-[13px] font-black text-gray-900 truncate mb-1" title={b.title}>{b.title}</h5>
                          
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {[
                              { id: 'đã trả', label: 'Tốt', color: 'emerald' },
                              { id: 'đã trả (vi phạm)', label: 'Hỏng nhẹ', color: 'orange' },
                              { id: 'hư hỏng nặng', label: 'Hỏng nặng', color: 'rose' },
                              { id: 'làm mất', label: 'Mất sách', color: 'slate' }
                            ].map(st => (
                              <button
                                key={st.id}
                                type="button"
                                onClick={() => {
                                  const newBooks = [...returnData.books];
                                  newBooks[idx].status = st.id;
                                  setReturnData({ ...returnData, books: newBooks });
                                }}
                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-tight transition-all border-2 ${
                                  b.status === st.id 
                                    ? `bg-${st.color}-500 border-${st.color}-500 text-white shadow-lg shadow-${st.color}-500/20` 
                                    : `bg-white border-gray-50 text-gray-400 hover:border-gray-100 hover:text-gray-600`
                                }`}
                              >
                                {st.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Detail inputs for specific book violation */}
                      {b.status !== 'đã trả' && (
                        <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Chi tiết lỗi</label>
                              <input 
                                type="text"
                                placeholder="Lý do chi tiết..."
                                className="w-full px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-primary/50"
                                value={b.reason}
                                onChange={(e) => {
                                  const newBooks = [...returnData.books];
                                  newBooks[idx].reason = e.target.value;
                                  setReturnData({ ...returnData, books: newBooks });
                                }}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] font-black text-gray-400 uppercase ml-1">Phí bồi thường</label>
                              <input 
                                type="number"
                                placeholder="0"
                                className="w-full px-3 py-2 bg-gray-50/50 border border-gray-100 rounded-xl text-xs font-black text-rose-500 outline-none focus:border-primary/50"
                                value={b.violationAmount}
                                onChange={(e) => {
                                  const newBooks = [...returnData.books];
                                  newBooks[idx].violationAmount = parseInt(e.target.value) || 0;
                                  setReturnData({ ...returnData, books: newBooks });
                                }}
                              />
                           </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* General Summary & Auto-calculated Fees */}
              <div className="space-y-6">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  
                  <div className="relative z-10 flex items-center justify-between mb-6">
                    <h5 className="text-sm font-black uppercase tracking-[0.2em] opacity-80">Tổng kết xử lý</h5>
                    <div className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
                       <ShieldCheck size={14} className="text-emerald-400" />
                       <span className="text-[10px] font-black uppercase">Quy chuẩn LMS</span>
                    </div>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="opacity-60 font-medium">Phí quá hạn (Tạm tính)</span>
                       <span className={returnData.violationAmount > 0 ? "text-rose-400" : "text-emerald-400"}>
                          {returnData.violationAmount.toLocaleString()}đ
                       </span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                       <span className="opacity-60 font-medium">Phí hư hại / Bồi thường</span>
                       <span className="text-emerald-400">
                          {returnData.books.reduce((sum, b) => sum + (b.violationAmount || 0), 0).toLocaleString()}đ
                       </span>
                    </div>
                    
                    <div className="h-px bg-white/10 my-4"></div>
                    
                    <div className="flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Tổng cộng phí vi phạm</p>
                          <p className="text-3xl font-black tracking-tight">
                            {(returnData.violationAmount + returnData.books.reduce((sum, b) => sum + (b.violationAmount || 0), 0)).toLocaleString()}đ
                          </p>
                       </div>
                       <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                          <CreditCard size={28} />
                       </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                    <FileText size={14} /> Ghi chú nghiệp vụ (Lưu trữ nội bộ)
                  </label>
                  <textarea
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-3xl focus:ring-4 focus:ring-primary/5 focus:border-primary/30 outline-none transition-all font-bold text-sm min-h-[100px] resize-none placeholder:text-gray-300"
                    placeholder="Mô tả sự việc nếu có tranh chấp hoặc xử lý đặc biệt..."
                    value={returnData.notes}
                    onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
                  ></textarea>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                 <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] font-bold text-blue-700/80 leading-relaxed">
                   Bằng việc nhấn "Lưu kết quả & Đóng hồ sơ", hệ thống sẽ tự động cập nhật kho, gửi thông báo thay đổi trạng thái cho độc giả và tạo hóa đơn phí phạt nếu có. Thao tác này không thể hoàn tác.
                 </p>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-8 border-t border-gray-50 bg-gray-50/30 shrink-0">
               <div className="flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setShowReturnModal(false)} 
                    className="flex-1 px-6 py-4 bg-white border border-gray-200 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 hover:text-gray-700 transition-all active:scale-95"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    onClick={handleReturnSubmit}
                    className="flex-[2] bg-gray-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200 active:scale-95 flex items-center justify-center gap-2"
                  >
                    Lưu kết quả & Đóng hồ sơ
                  </button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* RESULT MODAL (SUCCESS SUMMARY) */}
      {showResultModal && returnResult && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowResultModal(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in duration-300">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-3xl flex items-center justify-center mb-2">
                <CheckCircle2 size={48} />
              </div>
              <div>
                <h4 className="text-2xl font-black text-gray-900 leading-tight">Hoàn tất trả sách</h4>
                <p className="text-sm font-medium text-gray-500 mt-1">Hệ thống đã cập nhật trạng thái lưu thông</p>
              </div>

              <div className="w-full bg-gray-50 rounded-2xl p-6 space-y-4">
                <div className="flex justify-between items-start text-sm">
                  <span className="font-medium text-gray-500">Tài liệu:</span>
                  <div className="text-right">
                    {(returnResult.record?.books || []).map((b, i) => (
                      <p key={i} className="font-bold text-gray-900 truncate max-w-[200px]">{b.bookId?.title || "Tài liệu"}</p>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-500">Người mượn:</span>
                  <span className="font-bold text-gray-900">{returnResult.record?.readerId?.fullName}</span>
                </div>
                <div className="h-px bg-gray-200 w-full"></div>

                {returnResult.violation ? (
                  <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-gray-500">Loại chứng từ:</span>
                      <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-red-200">Phiếu phạt mới</span>
                    </div>
                    <div className="flex justify-between items-center bg-red-50/50 p-3 rounded-xl border border-red-100">
                      <span className="font-bold text-red-700 text-sm">Tổng phí vi phạm:</span>
                      <span className="text-xl font-black text-red-600">{(returnResult.violation.amount).toLocaleString()}đ</span>
                    </div>
                    <p className="text-[11px] text-gray-400 font-bold text-left italic">
                      * Lý do: {returnResult.violation.reason}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                    <Info size={16} />
                    <span className="text-xs font-bold uppercase tracking-wide">Trả đúng hạn & Hợp lệ</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowResultModal(false)}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
              >
                Đã hiểu
              </button>

              {returnResult.violation && (
                <p className="text-[10px] text-gray-400 font-medium">
                  Vui lòng hướng dẫn độc giả đến quầy thủ thư để xử lý khoản phí vi phạm này.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
      />

      <BorrowSlipModal
        isOpen={showSlipModal}
        onClose={() => { setShowSlipModal(false); setSelectedRecord(null); }}
        borrow={selectedRecord}
      />
    </div>
  );
};

export default BorrowsPage;

