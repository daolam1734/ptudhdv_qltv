import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import borrowService from "../../services/borrowService";
import readerService from "../../services/readerService";
import bookService from "../../services/bookService";
import {
  Search,
  Plus,
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
  AlertCircle
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
  const [showCreateModal, setShowCreateModal] = useState(false);
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

  // Search results for create modal
  const [readerResults, setReaderResults] = useState([]);
  const [bookResults, setBookResults] = useState([]);
  const [searchingReader, setSearchingReader] = useState(false);
  const [searchingBook, setSearchingBook] = useState(false);

  const [createData, setCreateData] = useState({
    readerId: "",
    bookIds: [],
    durationDays: 14
  });

  const [selectedBooks, setSelectedBooks] = useState([]);

  const [returnData, setReturnData] = useState({
    status: "returned",
    notes: "",
    hasViolation: false,
    violationAmount: 0,
    violationReason: ""
  });

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
      const res = await borrowService.returnBook(selectedRecord._id, returnData);

      // Save result and show result modal
      setReturnResult(res.data);
      setShowReturnModal(false);
      setShowResultModal(true);

      setSelectedRecord(null);
      setReturnData({
        status: "returned",
        notes: "",
        hasViolation: false,
        violationAmount: 0,
        violationReason: ""
      });

      fetchRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể xử lý trả sách");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!createData.readerId || createData.bookIds.length === 0) {
        toast.error("Vui lòng chọn độc giả và ít nhất một cuốn sách");
        return;
      }
      const res = await borrowService.create(createData);
      setShowCreateModal(false);
      setCreateData({ readerId: "", bookIds: [], durationDays: 14 });
      setSelectedBooks([]);
      setReaderResults([]);
      setBookResults([]);
      toast.success(res.message || 'Đã tạo lượt mượn mới thành công!');
      fetchRecords();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Lỗi khi tạo lượt mượn";
      toast.error(errorMsg, {
        duration: 5000,
        style: {
          borderRadius: '1rem',
          background: '#FFF',
          color: '#333',
          border: '1px solid #E5E7EB',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }
      });
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

  const searchReaders = async (q) => {
    if (q.length < 2) return;
    setSearchingReader(true);
    try {
      const res = await readerService.getAll({ search: q, limit: 5 });
      setReaderResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingReader(false);
    }
  };

  const searchBooks = async (q) => {
    if (q.length < 2) return;
    setSearchingBook(true);
    try {
      const res = await bookService.getAll({ title: q, limit: 5 });
      setBookResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingBook(false);
    }
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
          <div className="text-right hidden sm:block px-6 border-r border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tổng lượt mượn</p>
            <p className="text-2xl font-bold text-primary">{pagination.total || 0}</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus size={20} /> Tạo lượt mượn mới
          </button>
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
              {records.map((record) => (
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
                        <p className={`text-xs font-bold ${(record.status === 'overdue' || record.status === 'quá hạn') ? 'text-rose-500' : 'text-primary'}`}>
                          {(['pending', 'approved', 'rejected', 'đang chờ', 'đã duyệt', 'từ chối', 'đã hủy'].includes(record.status))
                            ? '---'
                            : new Date(record.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      {getStatusBadge(record.status)}
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
              ))}
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

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-gray-900">Cấp quyền mượn sách</h4>
                <p className="text-sm font-medium text-gray-500 mt-0.5">Vui lòng chọn độc giả và tài liệu để khởi tạo giao dịch</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">1. Tìm kiếm độc giả <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    placeholder="Nhập tên hoặc số CCCD..."
                    onChange={(e) => searchReaders(e.target.value)}
                  />
                  {readerResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 space-y-1 max-h-64 overflow-y-auto">
                      {readerResults.map(r => (
                        <button
                          key={r._id} type="button"
                          className={`w-full p-3 text-left rounded-xl hover:bg-primary-light/10 flex items-center justify-between transition-colors ${createData.readerId === r._id ? 'bg-primary-light/10' : ''}`}
                          onClick={() => { setCreateData({ ...createData, readerId: r._id }); setReaderResults([]); }}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center font-bold text-sm">{r.fullName?.charAt(0)}</div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm leading-tight">{r.fullName}</p>
                              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">{r.idCard || r.username}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex gap-1 justify-end">
                              {r.unpaidViolations > 0 && <span className="px-2 py-0.5 bg-red-50 text-red-500 rounded text-[10px] font-bold">Nợ vi phạm: {r.unpaidViolations.toLocaleString()}đ</span>}
                              {r.status !== 'active' && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] font-bold">Khóa</span>}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium mt-1">Đang mượn: {r.currentBorrowCount}/{r.borrowLimit}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {createData.readerId && (
                  <div className="mt-2 p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={16} className="text-primary" />
                      <span className="text-xs font-bold text-gray-700">Đã chọn: {readerResults.find(r => r._id === createData.readerId)?.fullName || "Độc giả #" + createData.readerId.substring(18)}</span>
                    </div>
                    <button type="button" onClick={() => setCreateData({ ...createData, readerId: '' })} className="text-[10px] font-bold text-red-500 hover:underline">Hủy chọn</button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">2. Chọn tài liệu mượn <span className="text-red-500">*</span></label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    placeholder="Tìm tiêu đề sách hoặc mã ISBN..."
                    onChange={(e) => searchBooks(e.target.value)}
                  />
                  {bookResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-50 mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 space-y-1 max-h-64 overflow-y-auto">
                      {bookResults.map(b => (
                        <button
                          key={b._id} type="button"
                          disabled={b.available <= 0 || createData.bookIds.includes(b._id)}
                          className={`w-full p-3 text-left rounded-xl hover:bg-primary/5 flex items-center justify-between transition-colors ${createData.bookIds.includes(b._id) ? 'bg-primary/5 opacity-80' : ''} ${b.available <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                          onClick={() => {
                            if (!createData.bookIds.includes(b._id)) {
                              setCreateData({ ...createData, bookIds: [...createData.bookIds, b._id] });
                              setSelectedBooks([...selectedBooks, b]);
                              setBookResults([]);
                            }
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <img src={b.coverImage} className="w-10 h-14 object-cover rounded-lg shadow-sm" alt="" />
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 text-sm leading-tight truncate max-w-[200px]">{b.title}</p>
                              <p className="text-[10px] text-gray-500 font-medium mt-0.5">{b.author}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-xs font-bold ${b.available > 0 ? 'text-primary' : 'text-red-500'}`}>
                              {b.available > 0 ? (createData.bookIds.includes(b._id) ? "Đã nằm trong danh sách" : `Sẵn có: ${b.available}`) : "Hết sách"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-medium">{b.isbn}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Books List */}
                <div className="space-y-2 mt-4 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedBooks.map((book, idx) => (
                    <div key={book._id || idx} className="p-3 bg-primary/5 rounded-xl border border-primary/10 flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                        <div>
                          <p className="text-xs font-bold text-gray-800 leading-tight">{book.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{book.isbn}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newIds = createData.bookIds.filter(id => id !== book._id);
                          const newBooks = selectedBooks.filter(b => b._id !== book._id);
                          setCreateData({ ...createData, bookIds: newIds });
                          setSelectedBooks(newBooks);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {selectedBooks.length === 0 && (
                    <p className="text-center py-4 text-gray-400 text-xs font-medium italic border-2 border-dashed border-gray-100 rounded-2xl">
                      Chưa có tài liệu nào được chọn
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Thời hạn mượn (Ngày)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-center"
                    value={createData.durationDays}
                    onChange={(e) => setCreateData({ ...createData, durationDays: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="w-full h-[52px] bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                    Cấp quyền mượn
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RETURN MODAL */}
      {showReturnModal && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReturnModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b border-gray-100 text-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <RotateCcw size={32} />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Xác nhận thu hồi tài liệu</h4>
              <div className="mt-4 px-6 space-y-2">
                {(selectedRecord.books || [{ bookId: selectedRecord.bookId }]).map((item, idx) => (
                  <p key={idx} className="text-xs font-bold text-gray-600 bg-gray-50 py-2 px-3 rounded-lg border border-gray-100 flex items-center gap-2">
                    <BookOpen size={14} className="text-primary" />
                    {item.bookId?.title}
                  </p>
                ))}
              </div>
            </div>

            <form onSubmit={handleReturnSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Ghi chú tình trạng trả sách</label>
                  <textarea
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm min-h-[100px] resize-none"
                    placeholder="Mô tả sơ lược về tình trạng tài liệu khi thu hồi..."
                    value={returnData.notes}
                    onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
                  ></textarea>
                </div>

                <div className={`p-5 rounded-[2rem] border transition-all ${returnData.hasViolation ? "bg-red-50/50 border-red-100 shadow-inner" : "bg-gray-50 border-gray-100"}`}>
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={returnData.hasViolation}
                        onChange={(e) => setReturnData({ ...returnData, hasViolation: e.target.checked, status: e.target.checked ? "vi phạm" : "đã trả" })}
                      />
                      <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </div>
                    <span className={`text-sm font-black uppercase tracking-wider ${returnData.hasViolation ? "text-red-600" : "text-gray-500"}`}>
                      {returnData.hasViolation ? "Ghi nhận vi phạm" : "Trả sách bình thường"}
                    </span>
                  </label>

                  {returnData.hasViolation && (
                    <div className="mt-6 space-y-4 animate-in slide-in-from-top-4 duration-300">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-red-700 ml-1 uppercase tracking-widest">Lý do vi phạm</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Làm mất trang, sách bị ướt..."
                          className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-bold text-sm text-gray-800"
                          value={returnData.violationReason}
                          onChange={(e) => setReturnData({ ...returnData, violationReason: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-red-700 ml-1 uppercase tracking-widest">Tổng phí phạt (VND)</label>
                        <input
                          type="number"
                          placeholder="Nhập số tiền..."
                          className="w-full px-4 py-3 bg-white border border-red-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-black text-xl text-red-600"
                          value={returnData.violationAmount}
                          onChange={(e) => setReturnData({ ...returnData, violationAmount: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                  Xử lý trả sách
                </button>
                <button type="button" onClick={() => setShowReturnModal(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all">
                  Hủy
                </button>
              </div>
            </form>
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
                <div className="flex justify-between items-center text-sm">
                  <span className="font-medium text-gray-500">Tài liệu:</span>
                  <span className="font-bold text-gray-900 truncate max-w-[200px]">{returnResult.record?.bookId?.title || "Tài liệu"}</span>
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

