import React, { useState, useEffect, useRef } from "react";
import bookService from "../../services/bookService";
import categoryService from "../../services/categoryService";
import { useAuth } from "../../context/AuthContext";
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Book, 
  Upload, 
  X, 
  Image as ImageIcon, 
  Tags, 
  Languages, 
  CheckCircle2,
  ChevronRight,
  Filter,
  MoreHorizontal,
  ArrowUpRight,
  BookOpen,
  Info,
  Eye,
  EyeOff
} from "lucide-react";

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  
  const isStaffOrAdmin = ["admin", "librarian"].includes(user?.role);
  
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    category: "Văn học hư cấu",
    publisher: "",
    publishYear: new Date().getFullYear(),
    lang: "Vietnamese",
    pages: 100,
    quantity: 1,
    description: "",
    status: "available",
    coverImage: "",
    location: ""
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await bookService.getAll({ 
          page, 
          limit: 12, 
          title: search,
          category: selectedCategory 
      });
      setBooks(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error("Failed to fetch books", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
        const res = await bookService.getCategories();
        setDbCategories(res.data || []);
    } catch (err) {
        console.error("Failed to fetch categories", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page, search, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (currentBook) {
      setFormData({
        title: currentBook.title,
        author: currentBook.author,
        isbn: currentBook.isbn,
        category: currentBook.category || "Văn học hư cấu",
        publisher: currentBook.publisher || "",
        publishYear: currentBook.publishYear || new Date().getFullYear(),
        lang: currentBook.lang || "Vietnamese",
        pages: currentBook.pages || 100,
        quantity: currentBook.quantity,
        description: currentBook.description || "",
        status: currentBook.status || "available",
        coverImage: currentBook.coverImage || "",
        location: currentBook.location || ""
      });
    } else {
      setFormData({
        title: "",
        author: "",
        isbn: "",
        category: "Văn học hư cấu",
        publisher: "",
        publishYear: new Date().getFullYear(),
        lang: "Vietnamese",
        pages: 100,
        quantity: 1,
        description: "",
        status: "available",
        coverImage: "",
        location: ""
      });
    }
  }, [currentBook]);

  const processImage = (file) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 600;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
        setFormData(prev => ({ ...prev, coverImage: compressedBase64 }));
      };
    };
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  const handleToggleStatus = async (book) => {
    const newStatus = book.status === "available" ? "unavailable" : "available";
    try {
      await bookService.update(book._id, { status: newStatus });
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này không?")) {
      try {
        await bookService.delete(id);
        fetchBooks();
      } catch (err) {
        alert(err.response?.data?.message || "Xóa sách thất bại");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const q = parseInt(formData.quantity) || 0;
      const payload = {
        ...formData,
        isbn: formData.isbn.replace(/\D/g, ""),
        publishYear: parseInt(formData.publishYear) || new Date().getFullYear(),
        pages: parseInt(formData.pages) || 0,
        quantity: q,
        available: currentBook ? undefined : q
      };

      if (currentBook) {
        await bookService.update(currentBook._id, payload);
      } else {
        await bookService.create(payload);
      }
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      alert(err.response?.data?.message || "Thao tác thất bại");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý Kho sách</h1>
          <p className="text-gray-500 font-medium mt-1">Quản lý danh mục và số lượng tài liệu trong thư viện</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block px-6 border-r border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tổng cộng</p>
            <p className="text-2xl font-bold text-primary">{pagination.totalItems || 0}</p>
          </div>
          {isStaffOrAdmin && (
            <button 
               onClick={() => { setCurrentBook(null); setShowModal(true); }}
               className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
               <Plus size={20} /> Thêm sách mới
            </button>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-lg group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
          <input 
            type="text"
            placeholder="Tìm theo tiêu đề, tác giả hoặc ISBN..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <div className="relative group">
              <select 
                value={selectedCategory}
                onChange={(e) => { 
                    setSelectedCategory(e.target.value);
                    setPage(1);
                }}
                className="appearance-none pl-12 pr-10 py-3 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 focus:outline-none focus:border-primary transition-all cursor-pointer min-w-[180px]"
              >
                  <option value="">Tất cả thể loại</option>
                  {dbCategories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.name}</option>
                  ))}
              </select>
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 rotate-90 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
         {loading ? (
             Array(10).fill(0).map((_, i) => (
                <div key={i} className="aspect-[3/4] bg-gray-100 rounded-2xl animate-pulse"></div>
             ))
         ) : books.map((book) => (
            <div key={book._id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden">
                <div className="relative aspect-[3/4] bg-gray-50 border-b border-gray-50 overflow-hidden">
                    <img 
                      src={book.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400"} 
                      alt={book.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-3 left-3">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-sm ${
                          book.available > 0 ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                        }`}>
                          {book.available > 1 ? `${book.available} bản` : book.available === 1 ? "1 bản" : "Hết hàng"}
                        </span>
                    </div>
                    {isStaffOrAdmin && (
                      <div className="absolute top-3 right-3 flex flex-col gap-2 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={(e) => { e.stopPropagation(); setCurrentBook(book); setShowModal(true); }}
                            className="p-2.5 bg-white rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-md"
                            title="Sửa thông tin"
                          >
                             <Edit size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleToggleStatus(book); }}
                            className={`p-2.5 bg-white rounded-xl ${book.status === 'available' ? 'text-blue-600 hover:bg-blue-600' : 'text-gray-400 hover:bg-gray-400'} hover:text-white transition-all shadow-md`}
                            title={book.status === 'available' ? "Ẩn sách" : "Hiện sách"}
                          >
                             {book.status === 'available' ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDelete(book._id); }}
                            className="p-2.5 bg-white rounded-xl text-red-600 hover:bg-red-600 hover:text-white transition-all shadow-md"
                            title="Xóa sách"
                          >
                             <Trash2 size={16} />
                          </button>
                      </div>
                    )}
                </div>

                <div className="p-4 space-y-3 flex-grow border-t border-gray-50">
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-primary transition-colors" title={book.title}>
                          {book.title}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 italic">{book.author}</p>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest pt-2 border-t border-gray-50">
                        <span>{book.category}</span>
                        <span>{book.isbn?.slice(-4)}...</span>
                    </div>
                </div>
            </div>
         ))}
      </div>

      {/* Empty State */}
      {!loading && books.length === 0 && (
         <div className="py-32 text-center bg-white rounded-2xl border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
               <Book size={40} />
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">Không tìm thấy tài liệu nào</p>
         </div>
      )}

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
                             className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${page === pageNum ? "bg-primary text-white shadow-md shadow-indigo-100" : "bg-transparent text-gray-500 hover:bg-gray-50"}`}
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

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                <div className="bg-white px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h4 className="text-xl font-bold text-gray-900">{currentBook ? "Cập nhật thông tin" : "Thêm sách mới"}</h4>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">Vui lòng điền đầy đủ các thông tin bắt buộc bên dưới</p>
                    </div>
                    <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>
                
                <form id="bookForm" onSubmit={handleSubmit} className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Title & Author */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Tiêu đề tác phẩm <span className="text-red-500">*</span></label>
                                <input 
                                    required
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    placeholder="Nhập tên đầy đủ của sách..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Tác giả <span className="text-red-500">*</span></label>
                                    <input 
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Tên tác giả..."
                                        value={formData.author}
                                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">ISBN</label>
                                    <input 
                                        required
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        placeholder="Mã ISBN..."
                                        value={formData.isbn}
                                        onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Phân loại</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                    >
                                        {[
                                            "Văn học hư cấu", 
                                            "Phi hư cấu", 
                                            "Khoa học", 
                                            "Công nghệ", 
                                            "Lịch sử", 
                                            "Tiểu sử", 
                                            "Văn học", 
                                            "Triết học", 
                                            "Giáo dục", 
                                            "Thiếu nhi", 
                                            "Truyện tranh", 
                                            "Sách tham khảo", 
                                            "Khác"
                                        ].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Ngôn ngữ</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.lang}
                                        onChange={(e) => setFormData({...formData, lang: e.target.value})}
                                    >
                                        <option value="Vietnamese">Tiếng Việt</option>
                                        <option value="English">Tiếng Anh</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Mô tả tóm tắt</label>
                                <textarea 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all min-h-[120px] resize-none"
                                    value={formData.description}
                                    placeholder="Viết một vài dòng giới thiệu về tác phẩm..."
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                ></textarea>
                            </div>
                        </div>

                        {/* Image & Stats */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700 ml-1">Ảnh bìa tác phẩm</label>
                                <div className="flex gap-4 items-center">
                                    <div className="w-24 aspect-[3/4] bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                                        {formData.coverImage ? (
                                            <img src={formData.coverImage} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <ImageIcon className="text-gray-300" size={24} />
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                         <button 
                                            type="button" 
                                            onClick={() => fileInputRef.current?.click()}
                                            className="px-4 py-2 bg-primary-light/10 text-primary rounded-lg font-bold text-sm hover:bg-indigo-100 transition-all flex items-center gap-2"
                                         >
                                            <Upload size={16} /> Tải ảnh lên
                                         </button>
                                         <p className="text-xs text-gray-400 font-medium italic leading-relaxed">Hỗ trợ JPG, PNG. Ảnh sẽ được tự động tối ưu hóa kích thước.</p>
                                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Số lượng tồn kho</label>
                                    <input 
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={formData.quantity}
                                        onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Năm xuất bản</label>
                                    <input 
                                        type="number"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        value={formData.publishYear}
                                        onChange={(e) => setFormData({...formData, publishYear: parseInt(e.target.value) || new Date().getFullYear()})}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Vị trí kệ sách</label>
                                    <input 
                                        type="text"
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        placeholder="Ví dụ: Kệ A-12..."
                                        value={formData.location || ""}
                                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 ml-1">Trạng thái</label>
                                    <select 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        value={formData.status}
                                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                                    >
                                        <option value="available">Đang hiển thị</option>
                                        <option value="unavailable">Đang ẩn</option>
                                        <option value="maintenance">Bảo trì</option>
                                        <option value="discontinued">Ngừng cung cấp</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-8 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-100 transition-all">Huỷ bỏ</button>
                    <button form="bookForm" type="submit" className="px-10 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                        {currentBook ? "Cập nhật ngay" : "Tạo sách mới"}
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default BooksPage;

