import React, { useState, useEffect } from "react";
import staffService from "../../services/staffService";
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Trash2,
  Users,
  Search,
  Plus,
  Edit,
  CheckCircle2,
  ChevronRight,
  Filter,
  Zap,
  Shield,
  Fingerprint
} from "lucide-react";

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "librarian",
    status: "active"
  });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const res = await staffService.getAll();
      setStaff(res.data);
    } catch (err) {
      console.error("Failed to fetch staff", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentMember) {
        // Update
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await staffService.update(currentMember._id, updateData);
        setMessage({ type: 'success', text: 'Cập nhật thông tin nhân sự thành công!' });
      } else {
        // Create
        await staffService.create(formData);
        setMessage({ type: 'success', text: 'Thêm nhân sự mới thành công!' });
      }
      setShowModal(false);
      fetchStaff();
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  const handleEdit = (member) => {
    setCurrentMember(member);
    setFormData({
      username: member.username,
      email: member.email,
      password: "", // Don't show password
      fullName: member.fullName,
      phone: member.phone || "",
      role: member.role || "librarian",
      status: member.status || "active"
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa thành viên này khỏi hệ thống?")) {
      try {
        await staffService.delete(id);
        setMessage({ type: 'success', text: 'Đã xóa thành công' });
        fetchStaff();
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } catch (err) {
        alert("Không thể thực hiện thao tác này");
      }
    }
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { 
        bg: "bg-rose-50 border-rose-100 text-rose-600",
        icon: <Shield size={10} />,
        label: "Quản trị viên"
      },
      librarian: { 
        bg: "bg-primary-light/10 border-indigo-100 text-primary",
        icon: <Fingerprint size={10} />,
        label: "Thủ thư"
      }
    };
    
    const style = roles[role?.toLowerCase()] || roles.librarian;
    
    return (
      <div className={`px-3 py-1 rounded-lg border ${style.bg} flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider`}>
        {style.icon}
        {style.label}
      </div>
    );
  };

  const filteredStaff = staff.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Nhân sự</h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý đội ngũ vận hành hệ thống</p>
        </div>
        <button 
          onClick={() => {
            setCurrentMember(null);
            setFormData({
              username: "",
              email: "",
              password: "",
              fullName: "",
              phone: "",
              role: "librarian",
              status: "active"
            });
            setShowModal(true);
          }}
          className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={20} /> Thêm nhân sự
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
            placeholder="Tìm kiếm nhân sự..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative group">
              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:border-primary transition-all cursor-pointer shadow-sm"
              >
                  <option value="all">Tất cả vai trò</option>
                  <option value="admin">Quản trị viên</option>
                  <option value="librarian">Thủ thư</option>
              </select>
              <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={14} />
          </div>
          <div className="relative group">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:border-primary transition-all cursor-pointer shadow-sm"
              >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="inactive">Đã khóa</option>
              </select>
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Staff List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Thành viên</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="5" className="px-6 py-8 h-20 bg-gray-50/20"></td>
                  </tr>
                ))
              ) : filteredStaff.length > 0 ? (
                filteredStaff.map((person) => (
                  <tr key={person._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary-light/10 flex items-center justify-center text-primary font-bold text-sm">
                          {person.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{person.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">@{person.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 border-l border-gray-50/50">
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <Mail size={12} className="text-gray-400" />
                        {person.email}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {getRoleBadge(person.role)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${person.status === 'active' ? 'bg-emerald-500' : person.status === 'suspended' ? 'bg-amber-500' : 'bg-gray-400'}`}></div>
                        <span className="text-xs font-bold text-gray-700">
                          {person.status === 'active' ? 'Đang hoạt động' : person.status === 'suspended' ? 'Đang tạm dừng' : 'Ngưng hoạt động'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(person)}
                            className="p-2 text-gray-400 hover:text-primary hover:bg-primary-light/10 rounded-xl transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(person._id)}
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
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <Users size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-400 font-bold italic">Không tìm thấy nhân sự nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h4 className="text-xl font-bold text-gray-900">{currentMember ? "Cập nhật nhân sự" : "Thêm nhân sự mới"}</h4>
                <p className="text-sm font-medium text-gray-500 mt-0.5">Vui lòng điền đầy đủ thông tin định danh hệ thống</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                <Plus className="rotate-45" size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Họ và tên</label>
                  <input 
                    required
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Nguyễn Văn A..."
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Tên đăng nhập</label>
                  <input 
                    required
                    disabled={!!currentMember}
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:opacity-50"
                    placeholder="nvana..."
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase()})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email liên hệ</label>
                  <input 
                    required
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="a.nguyen@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value.toLowerCase()})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Số điện thoại</label>
                  <input 
                    type="text"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="09xxx..."
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Phân quyền</label>
                  <select 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="librarian">Thủ thư (Librarian)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Trạng thái</label>
                   <select 
                     className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                     value={formData.status}
                     onChange={(e) => setFormData({...formData, status: e.target.value})}
                   >
                     <option value="active">Đang hoạt động</option>
                     <option value="suspended">Tạm dừng</option>
                     <option value="inactive">Ngưng hoạt động</option>
                   </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">
                  Mật khẩu {currentMember && "(Để trống nếu không đổi)"}
                </label>
                <input 
                  required={!currentMember}
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
                  {currentMember ? "Cập nhật tài khoản" : "Tạo tài khoản ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffPage;

