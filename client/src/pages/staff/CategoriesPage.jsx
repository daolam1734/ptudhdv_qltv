import React, { useState, useEffect } from "react";
import categoryService from "../../services/categoryService";
import toast from "react-hot-toast";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Tags, 
  X, 
  CheckCircle2,
  ChevronRight,
  Info,
  Layers,
  Activity,
  AlertCircle,
  Book,
  FileText,
  BarChart3
} from "lucide-react";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll({ 
          page, 
          limit: 10, 
          name: search
      });
      setCategories(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch categories", err);
      toast.error("Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, search]);

  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name,
        description: currentCategory.description || "",
        isActive: currentCategory.isActive
      });
    } else {
      setFormData({
        name: "",
        description: "",
        isActive: true
      });
    }
  }, [currentCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(currentCategory ? 'Đang cập nhật...' : 'Đang xử lý...');
    try {
      if (currentCategory) {
        await categoryService.update(currentCategory._id, formData);
        toast.success('Cập nhật danh mục thành công!', { id: loadingToast });
      } else {
        await categoryService.create(formData);
        toast.success('Thêm danh mục mới thành công!', { id: loadingToast });
      }
      setShowModal(false);
      setCurrentCategory(null);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra', { id: loadingToast });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      const loadingToast = toast.loading('Đang xóa...');
      try {
        await categoryService.remove(id);
        toast.success('Xóa danh mục thành công!', { id: loadingToast });
        fetchCategories();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Không thể xóa danh mục đang có sách', { id: loadingToast });
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Tags className="text-primary" size={28} />
            Quản lý Danh mục
          </h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý các thể loại sách trong hệ thống thư viện</p>
        </div>
        <button 
           onClick={() => { setCurrentCategory(null); setShowModal(true); }}
           className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
        >
           <Plus size={20} /> Thêm danh mục mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Tổng danh mục</p>
            <p className="text-2xl font-black text-gray-900">{pagination.totalItems || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Đang hoạt động</p>
            <p className="text-2xl font-black text-gray-900">
              {categories.filter(c => c.isActive).length}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Số sách hiện có</p>
            <p className="text-2xl font-black text-gray-900">
              {categories.reduce((acc, curr) => acc + (Number(curr.bookCount) || 0), 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Tìm kiếm tên danh mục..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Tên danh mục</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Mô tả</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Số lượng sách</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Đang tải dữ liệu...</td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Không có danh mục nào</td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                          <Layers size={18} />
                        </div>
                        <span className="font-bold text-gray-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm text-gray-500 font-medium line-clamp-1">{cat.description || "Chưa có mô tả"}</p>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Book size={14} className="text-gray-400" />
                        <span className="font-bold text-gray-700">
                          {typeof cat.bookCount === 'number' ? cat.bookCount : (Array.isArray(cat.bookCount) ? cat.bookCount.length : 0)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${cat.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                        {cat.isActive ? 'Hoạt động' : 'Tạm khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => { setCurrentCategory(cat); setShowModal(true); }}
                          className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat._id)}
                          className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                          disabled={cat.bookCount > 0}
                          title={cat.bookCount > 0 ? "Không thể xóa danh mục đang có sách" : "Xóa danh mục"}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
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
      )}

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h4 className="text-xl font-bold text-gray-900">{currentCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</h4>
                  <p className="text-sm font-medium text-gray-500 mt-0.5">Vui lòng nhập đầy đủ thông tin danh mục</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                    <X size={20} />
                </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Tên danh mục <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm"
                  placeholder="Ví dụ: Văn học, Khoa học..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Mô tả chi tiết</label>
                <textarea 
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium text-sm min-h-[120px] resize-none"
                  placeholder="Nhập mô tả cho danh mục này..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                ></textarea>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex-1">
                   <p className="text-sm font-bold text-gray-900">Cho phép hoạt động</p>
                   <p className="text-xs text-gray-500 font-medium italic">Cho phép sử dụng danh mục này khi thêm sách mới</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className={`w-12 h-6 rounded-full transition-all relative ${formData.isActive ? 'bg-primary' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isActive ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20">
                  {currentCategory ? 'Lưu thay đổi' : 'Tạo danh mục'}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-4 bg-white border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-100 transition-all">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
