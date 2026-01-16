import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  Book as BookIcon, 
  User, 
  Hash, 
  Globe, 
  Calendar, 
  Info, 
  Layers, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LogIn,
  Heart
} from "lucide-react";
import bookService from "../../services/bookService";
import readerService from "../../services/readerService";
import borrowService from "../../services/borrowService";
import { useAuth } from "../../context/AuthContext";
import { useBasket } from "../../context/BasketContext";
import ConfirmModal from "../../components/common/ConfirmModal";
import toast from "react-hot-toast";

const BookDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToBasket } = useBasket();
  
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await bookService.getById(id);
      setBook(response.data);
      
      if (isAuthenticated) {
        const favResponse = await readerService.getFavorites();
        const favoriteIds = (favResponse.data || []).map(b => b._id);
        setIsFavorite(favoriteIds.includes(id));
      }
    } catch (error) {
      console.error("Error fetching book details:", error);
      toast.error("Không thể tải thông tin sách.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [id, isAuthenticated]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để lưu sách yêu thích!");
      navigate("/login");
      return;
    }

    try {
      const response = await readerService.toggleFavorite(id);
      if (response.success) {
        setIsFavorite(!isFavorite);
        toast.success(isFavorite ? "Đã xóa khỏi danh sách yêu thích" : "Đã thêm vào danh sách yêu thích", {
          icon: isFavorite ? "🗑️" : "❤️",
        });
      }
    } catch (error) {
      toast.error("Không thể cập nhật danh sách yêu thích");
    }
  };

  const handleAddToBasket = () => {
    if (!isAuthenticated) {
      toast.error("Vui lòng đăng nhập để mượn sách");
      navigate('/login');
      return;
    }

    if (book.available === 0) {
        toast.error("Sách hiện đã hết, không thể mượn");
        return;
    }

    const success = addToBasket(book, quantity);
    // Removed automatic redirect to focus on better interaction
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light/30">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!book && !loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-light/30 gap-6">
        <div className="p-6 bg-white rounded-full shadow-xl text-rose-500">
           <AlertCircle size={48} />
        </div>
        <div className="text-center">
           <h2 className="text-2xl font-bold text-neutral-dark mb-2">Không tìm thấy sách</h2>
           <p className="text-gray-500">Cuốn sách bạn tìm kiếm có thể đã bị xóa hoặc không tồn tại.</p>
        </div>
        <button 
          onClick={() => navigate("/books")}
          className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Quay lại kho sách
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-light/30 pb-20">
      {/* Dynamic Header/Breadcrumb */}
      <div className="bg-white border-b border-gray-100 sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
           <button 
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 text-gray-500 hover:text-primary font-bold text-sm transition-colors group"
           >
             <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-primary/10 transition-colors">
                <ArrowLeft size={16} />
             </div>
             Quay lại
           </button>
           <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
              <Link to="/" className="hover:text-primary">Trang chủ</Link>
              <span>/</span>
              <Link to="/books" className="hover:text-primary">Kho sách</Link>
              <span>/</span>
              <span className="text-neutral-dark truncate max-w-[200px]">{book.title}</span>
           </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="bg-white rounded-[3rem] shadow-xl shadow-primary/5 border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left: Enhanced Book Cover */}
            <div className="lg:col-span-5 p-8 lg:p-12 bg-neutral-light/20 flex flex-col items-center">
              <div className="w-full max-w-[350px] aspect-[3/4] rounded-[2.5rem] bg-white shadow-2xl shadow-neutral-dark/10 overflow-hidden border-8 border-white relative group">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-100 bg-gradient-to-br from-neutral-light to-white">
                    <BookIcon size={120} strokeWidth={0.5} className="text-primary/10" />
                  </div>
                )}
                <div className="absolute top-6 right-6 flex flex-col gap-3">
                   <div className={`px-4 py-2 rounded-2xl text-xs font-bold shadow-xl backdrop-blur-md ${
                     book.available > 0 ? "bg-emerald-500/90 text-white" : "bg-rose-500/90 text-white"
                   }`}>
                     {book.available > 0 ? `Sẵn sàng (${book.available})` : "Đã hết sách"}
                   </div>
                   <button 
                    onClick={handleToggleFavorite}
                    className={`p-3 rounded-2xl shadow-xl backdrop-blur-md transition-all active:scale-90 ${
                      isFavorite ? "bg-rose-500 text-white" : "bg-white/90 text-gray-400 hover:text-rose-500"
                    }`}
                   >
                     <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                   </button>
                </div>
              </div>
              
              <div className="mt-12 w-full space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center shadow-sm">
                       <p className="text-[10px] items-center justify-center flex gap-1 uppercase font-bold text-gray-400 mb-2">
                          <Layers size={12} className="text-primary" /> Tổng số lượng
                       </p>
                       <p className="text-2xl font-bold text-neutral-dark">{book.quantity}</p>
                    </div>
                    <div className="bg-white p-6 rounded-3xl border border-gray-100 text-center shadow-sm">
                       <p className="text-[10px] items-center justify-center flex gap-1 uppercase font-bold text-gray-400 mb-2">
                          <Clock size={12} className="text-primary" /> Hạn mượn
                       </p>
                       <p className="text-2xl font-bold text-neutral-dark">14 <span className="text-xs">ngày</span></p>
                    </div>
                 </div>
              </div>
            </div>

            {/* Right: Detailed Content */}
            <div className="lg:col-span-7 p-8 lg:p-12 space-y-10">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl text-xs font-bold uppercase tracking-wider">
                  <Layers size={14} /> {book.categoryId?.name || book.category}
                </div>
                <h1 className="text-4xl lg:text-5xl font-bold text-neutral-dark leading-[1.1]">{book.title}</h1>
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-light flex items-center justify-center text-primary border border-gray-100 shadow-sm">
                         <User size={20} />
                      </div>
                      <div>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Tác giả</p>
                         <p className="text-sm font-bold text-neutral-dark underline underline-offset-4 decoration-primary/20">{book.author}</p>
                      </div>
                   </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 bg-neutral-light/30 p-8 rounded-[2.5rem] border border-gray-100 shadow-inner">
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                       <Hash size={16} />
                       <span className="text-[10px] uppercase font-bold text-gray-400">ISBN</span>
                    </div>
                    <p className="font-bold text-neutral-dark">{book.isbn}</p>
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                       <Info size={16} />
                       <span className="text-[10px] uppercase font-bold text-gray-400">Nhà XB</span>
                    </div>
                    <p className="font-bold text-neutral-dark truncate">{book.publisher}</p>
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                       <Calendar size={16} />
                       <span className="text-[10px] uppercase font-bold text-gray-400">Năm XB</span>
                    </div>
                    <p className="font-bold text-neutral-dark">{book.publishYear}</p>
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                       <Globe size={16} />
                       <span className="text-[10px] uppercase font-bold text-gray-400">Ngôn ngữ</span>
                    </div>
                    <p className="font-bold text-neutral-dark">{book.lang || "Tiếng Việt"}</p>
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                       <Layers size={16} />
                       <span className="text-[10px] uppercase font-bold text-gray-400">Số trang</span>
                    </div>
                    <p className="font-bold text-neutral-dark">{book.pages} trang</p>
                 </div>
                 <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                       <MapPin size={16} />
                       <span className="text-[10px] uppercase font-bold text-gray-400">Vị trí kho</span>
                    </div>
                    <p className="font-bold text-neutral-dark">Kệ {book.location?.shelf || "A1"}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-lg font-bold text-neutral-dark flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                    Tóm tắt nội dung
                 </h4>
                 <p className="text-gray-500 leading-relaxed font-medium text-base first-letter:text-3xl first-letter:font-bold first-letter:text-primary first-letter:mr-1">
                    {book.description || "Cuốn sách cung cấp kiến thức nền tảng và chuyên sâu về lĩnh vực nghiên cứu, giúp độc giả mở rộng tư duy và áp dụng vào thực tế học tập, làm việc hiệu quả."}
                 </p>
              </div>

              {/* Action Area */}
              <div className="pt-8 border-t border-gray-100 flex flex-col gap-6">
                 {isAuthenticated ? (
                   <div className="flex flex-col sm:flex-row gap-4 items-center w-full">
                      {book.available > 0 && (
                        <div className="flex items-center bg-gray-100 p-1 rounded-2xl border border-gray-200">
                          <button 
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-12 h-12 flex items-center justify-center font-bold text-xl hover:bg-white rounded-xl transition-colors"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                          <button 
                            onClick={() => setQuantity(Math.min(book.available, quantity + 1))}
                            className="w-12 h-12 flex items-center justify-center font-bold text-xl hover:bg-white rounded-xl transition-colors"
                          >
                            +
                          </button>
                        </div>
                      )}
                      
                      <button 
                          onClick={handleAddToBasket}
                          disabled={book.available === 0}
                          className="flex-1 py-6 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 shadow-2xl shadow-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
                      >
                          <ShoppingBag size={24} className="group-hover:animate-bounce" />
                          {book.available > 0 ? "THÊM VÀO TỦ SÁCH MƯỢN" : "SÁCH HIỆN ĐÃ HẾT"}
                      </button>
                   </div>
                 ) : (
                   <button 
                      onClick={() => navigate("/login")}
                      className="w-full py-6 bg-neutral-dark text-white rounded-2xl font-bold hover:bg-primary transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl"
                   >
                      <LogIn size={24} />
                      ĐĂNG NHẬP ĐỂ MƯỢN SÁCH
                   </button>
                 )}
                 <div className="flex items-center gap-4">
                    <button 
                        onClick={handleToggleFavorite}
                        className={`flex-1 p-6 rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-3 border-2 ${
                        isFavorite 
                        ? "bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100" 
                        : "bg-white border-gray-100 text-gray-500 hover:bg-gray-50 hover:text-rose-500"
                        }`}
                        title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                    >
                        <Heart size={24} fill={isFavorite ? "currentColor" : "none"} className={isFavorite ? "animate-pulse" : ""} />
                        <span>{isFavorite ? "Đã yêu thích" : "Yêu thích"}</span>
                    </button>
                    <div className="hidden lg:flex flex-col items-center justify-center px-8 border-l border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Đánh giá</p>
                        <div className="flex text-amber-400">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} />
                        </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internal Star Component for UI
const Star = ({ size, fill, className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={fill || "none"} 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default BookDetailPage;
