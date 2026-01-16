import React, { useState, useEffect } from "react";
import readerService from "../../services/readerService";
import { 
  Search, 
  UserPlus, 
  Users,
  Plus,
  Filter,
  CheckCircle2,
  Mail,
  Phone,
  Trash2,
  Edit,
  ChevronRight,
  ClipboardList,
  AlertTriangle,
  Info,
  DollarSign
} from "lucide-react";

const ReadersPage = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyReader, setHistoryReader] = useState(null);
  const [readerHistory, setReaderHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [currentReader, setCurrentReader] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    idCard: "",
    membershipType: "basic",
    status: "active",
    address: ""
  });

  useEffect(() => {
    fetchReaders();
  }, [page, search, statusFilter, membershipFilter]);

  const fetchReaders = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10, search };
      if (statusFilter !== "all") params.status = statusFilter;
      if (membershipFilter !== "all") params.membershipType = membershipFilter;

      const res = await readerService.getAll(params);
      setReaders(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch readers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentReader) {
        // Update
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await readerService.update(currentReader._id, updateData);
        setMessage({ type: 'success', text: 'Cập nhật độc giả thành công!' });
      } else {
        // Create
        await readerService.create(formData);
        setMessage({ type: 'success', text: 'Đăng ký độc giả mới thành công!' });
      }
      setShowModal(false);
      fetchReaders();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleEdit = (reader) => {
    setCurrentReader(reader);
    setFormData({
      username: reader.username || "",
      email: reader.email || "",
      password: "",
      fullName: reader.fullName || "",
      phone: reader.phone || "",
      idCard: reader.idCard || "",
      membershipType: reader.membershipType || "basic",
      status: reader.status || "active",
      address: reader.address || ""
    });
    setShowModal(true);
  };

  const handleViewHistory = async (reader) => {
    setHistoryReader(reader);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await readerService.getHistory(reader._id);
      // Ensure history is an array
      const data = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setReaderHistory(data);
    } catch (err) {
      console.error("Failed to fetch history", err);
      setReaderHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hệ thống sẽ vô hiệu hóa tài khoản độc giả này. Tiếp tục?")) {
      try {
        await readerService.delete(id);
        setMessage({ type: 'success', text: 'Đã cập nhật trạng thái độc giả thành công' });
        fetchReaders();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        alert("Thao tác thất bại");
      }
    }
  };

  const getStatusBadge = (status, unpaidFines = 0) => {
    if (unpaidFines > 0) {
        return (
            <span className="px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white border border-rose-600 shadow-sm flex items-center gap-1 justify-center">
                <AlertTriangle size={10} /> Vi phạm
            </span>
        );
    }
    const styles = {
      active: "bg-emerald-50 text-emerald-600 border-emerald-100",
      inactive: "bg-gray-100 text-gray-500 border-gray-200",
      suspended: "bg-rose-50 text-rose-600 border-rose-100",
      expired: "bg-amber-50 text-amber-600 border-amber-100"
    };
    const labels = {
      active: "Hoạt động",
      inactive: "Đã khóa",
      suspended: "Đình chỉ",
      expired: "Hết hạn"
    };
    return (
      <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[status] || styles.inactive}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Độc giả</h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý danh sách thành viên và thẻ thư viện</p>
        </div>
        <button 
          onClick={() => {
            setCurrentReader(null);
            setFormData({
              username: "",
              email: "",
              password: "",
              fullName: "",
              phone: "",
              idCard: "",
              membershipType: "basic",
              status: "active",
              address: ""
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <UserPlus size={20} /> Đăng ký thành viên
        </button>
      </div>

      {message.text && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-800">
          <CheckCircle2 size={24} className="text-emerald-500" />
          <p className="font-bold text-sm tracking-tight">{message.text}</p>
        </div>
      )}

      {/* Control & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm theo tên, email, CCCD..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative group">
              <select 
                value={membershipFilter}
                onChange={(e) => {
                    setMembershipFilter(e.target.value);
                    setPage(1);
                }}
                className="appearance-none pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:border-primary transition-all cursor-pointer shadow-sm"
              >
                  <option value="all">Loại thành viên</option>
                  <option value="basic">Cơ bản</option>
                  <option value="premium">Cao cấp</option>
                  <option value="vip">VIP</option>
              </select>
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={14} />
          </div>
          <div className="relative group">
              <select 
                value={statusFilter}
                onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                }}
                className="appearance-none pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:border-primary transition-all cursor-pointer shadow-sm"
              >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Hoạt động</option>
                  <option value="suspended">Bị đình chỉ</option>
                  <option value="expired">Hết hạn thẻ</option>
                  <option value="inactive">Đã khóa</option>
              </select>
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin độc giả</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thông tin liên hệ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Đang mượn</th>                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Nợ phí</th>                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="6" className="px-6 py-8 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : readers.length > 0 ? (
                readers.map((reader) => (
                  <tr key={reader._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center text-primary font-bold text-sm">
                          {reader.fullName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{reader.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">@{reader.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <Mail size={12} className="text-gray-400" />
                          {reader.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                          <Phone size={12} className="text-gray-400" />
                          {reader.phone || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                        <div className="inline-flex flex-col items-center">
                            <span className="text-sm font-black text-gray-900">{reader.currentBorrowCount || 0}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">cuốn sách</span>
                        </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                        {reader.unpaidFines > 0 ? (
                            <div className="inline-flex flex-col items-center group/fine relative">
                                <span className="text-sm font-black text-rose-600 tabular-nums">
                                    {reader.unpaidFines.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-[9px] font-bold text-rose-400 uppercase tracking-tighter">chưa thanh toán</span>
                            </div>
                        ) : (
                            <span className="text-xs text-emerald-500 font-bold italic opacity-40">Không nợ</span>
                        )}
                    </td>
                    <td className="px-6 py-5 text-center">
                        {getStatusBadge(reader.status, reader.unpaidFines)}
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleViewHistory(reader)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                            title="Lịch sử mượn trả"
                          >
                            <ClipboardList size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(reader)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light/10 rounded-xl transition-all"
                            title="Chỉnh sửa"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(reader._id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-20 text-center">
                    <Users size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold italic">Không tìm thấy độc giả nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center pt-4 pb-8">
        <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-sm border border-gray-100 items-center">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:bg-primary hover:text-white disabled:opacity-30 transition-all font-bold"
          >
            <ChevronRight className="rotate-180" size={18} />
          </button>
          <div className="flex gap-1">
             {[...Array(pagination.totalPages || 0)].map((_, i) => (
                <button 
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === i + 1 ? "bg-primary text-white shadow-md shadow-indigo-100" : "bg-transparent text-gray-500 hover:bg-gray-50"}`}
                >
                  {i + 1}
                </button>
             ))}
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

      {/* Modal Add/Edit Reader */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{currentReader ? "Cập nhật độc giả" : "Đăng ký độc giả mới"}</h4>
                <p className="text-sm font-medium text-gray-500 mt-0.5">Vui lòng điền đầy đủ thông tin thành viên thư viện</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Họ và tên</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Nguyễn Văn B..."
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tên đăng nhập</label>
                  <input 
                    required
                    disabled={!!currentReader}
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                    placeholder="reader123..."
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email</label>
                  <input 
                    required
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="0912xxx..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Hạng thành viên</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                    value={formData.membershipType}
                    onChange={(e) => setFormData({...formData, membershipType: e.target.value})}
                  >
                    <option value="basic">Thành viên Cơ bản</option>
                    <option value="premium">Thành viên Cao cấp</option>
                    <option value="vip">Thành viên VIP</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Trạng thái tài khoản</label>
                   <select 
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                     value={formData.status}
                     onChange={(e) => setFormData({...formData, status: e.target.value})}
                   >
                     <option value="active">Đang hoạt động</option>
                     <option value="suspended">Bị đình chỉ (Suspended)</option>
                     <option value="expired">Hết hạn thẻ (Expired)</option>
                     <option value="inactive">Đã khóa tài khoản</option>
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Địa chỉ</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="Số nhà, đường, quận/huyện..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Mật khẩu {currentReader && "(Để trống nếu không đổi)"}
                </label>
                <input 
                  required={!currentReader}
                  type="password"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-4 bg-gray-50 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-100"
                >
                  Huỷ bỏ
                </button>
                <button 
                  type="submit"
                  className="flex-[2] px-6 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
                >
                  {currentReader ? "Cập nhật thông tin" : "Tạo tài khoản độc giả"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && historyReader && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)}></div>
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-gray-900">Chi tiết mượn trả</h4>
                <p className="text-sm font-medium text-gray-500 mt-0.5">Độc giả: {historyReader.fullName}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {loadingHistory ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : readerHistory.length > 0 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {readerHistory.map((item) => (
                      <div key={item._id} className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:bg-gray-50 transition-all">
                         <img src={item.bookId?.coverImage} alt="" className="w-12 h-16 object-cover rounded shadow-sm" />
                         <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 truncate">{item.bookId?.title}</p>
                            <div className="flex gap-4 mt-1">
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mượn: {new Date(item.borrowDate).toLocaleDateString()}</span>
                               <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hạn: {new Date(item.dueDate).toLocaleDateString()}</span>
                            </div>
                         </div>
                         <div className="text-right">
                             <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                item.status === 'borrowed' ? 'bg-blue-50 text-blue-600' :
                                item.status === 'overdue' ? 'bg-red-50 text-red-600' :
                                item.status === 'returned' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-600'
                             }`}>
                                {item.status}
                             </span>
                             {item.returnDate && (
                                <p className="text-[9px] text-gray-400 mt-1">Trả: {new Date(item.returnDate).toLocaleDateString()}</p>
                             )}
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20">
                     <ClipboardList size={40} className="mx-auto text-gray-200 mb-2" />
                     <p className="text-gray-400 font-medium">Chưa có lịch sử lưu thông</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReadersPage;

