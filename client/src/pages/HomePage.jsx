import React, { useState, useEffect } from "react";
import {
   Book,
   Clock,
   ChevronRight,
   BookOpen,
   CheckCircle2,
   AlertCircle,
   TrendingUp,
   Bookmark,
   Calendar,
   Sparkles,
   Search,
   Star,
   Users,
   Compass,
   ArrowRight,
   Heart
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import borrowService from "../services/borrowService";
import bookService from "../services/bookService";
import readerService from "../services/readerService";
import BookCard from "../components/common/BookCard";
import { toast } from "react-hot-toast";

const StatCard = ({ label, value, icon, bg, text }) => (
   <div className={`${bg} ${text} p-8 rounded-[2.5rem] shadow-xl hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden ring-1 ring-black/5`}>
      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-700">
         {icon}
      </div>
      <div className="relative z-10 space-y-2" >
         <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{label}</p>
         <h3 className="text-4xl font-black">{value}</h3>
      </div>
   </div>
);

const HomePage = () => {
   const { user, isAuthenticated } = useAuth();
   const navigate = useNavigate();
   const [stats, setStats] = useState({
      borrowing: 0,
      returned: 0,
      overdue: 0
   });
   const [recentBorrows, setRecentBorrows] = useState([]);
   const [newBooks, setNewBooks] = useState([]);
   const [categories, setCategories] = useState([]);
   const [loading, setLoading] = useState(true);
   const [searchQuery, setSearchQuery] = useState("");
   const [favorites, setFavorites] = useState([]);

   const fetchFavorites = async () => {
      if (isAuthenticated && user?.role === 'reader') {
         try {
            const response = await readerService.getFavorites();
            setFavorites((response.data || []).map(f => f._id));
         } catch (error) {
            console.error("Error fetching favorites:", error);
         }
      }
   };

   useEffect(() => {
      const fetchDashboardData = async () => {
         try {
            setLoading(true);
            const promises = [
               bookService.getAll({ limit: 8, sort: '-createdAt' }),
               bookService.getCategories()
            ];

            // Only fetch history and favorites if authenticated as a reader
            if (isAuthenticated && user?.role === 'reader') {
               promises.push(borrowService.getMyHistory());
               promises.push(readerService.getFavorites());
            }

            const [booksRes, catRes, historyRes, favRes] = await Promise.all(promises);

            if (isAuthenticated && user?.role === 'reader' && historyRes) {
               const history = Array.isArray(historyRes.data) ? historyRes.data : (historyRes.data?.data || []);

               const borrowingCount = history.filter(h => h.status === 'borrowed' || h.status === 'pending' || h.status === 'approved').length;
               const returnedCount = history.filter(h => ['returned', 'damaged', 'damaged_heavy', 'lost'].includes(h.status)).length;
               const overdueCount = history.filter(h => h.status === 'overdue').length;

               setStats({
                  borrowing: borrowingCount + overdueCount,
                  returned: returnedCount,
                  overdue: overdueCount
               });

               setRecentBorrows(history.slice(0, 3));
            }

            if (isAuthenticated && user?.role === 'reader' && favRes) {
               setFavorites((favRes.data || []).map(f => f._id));
            }

            setNewBooks(booksRes.data?.books || booksRes.data || []);
            setCategories(catRes?.data || []);
            setLoading(false);
         } catch (err) {
            console.error("Failed to fetch dashboard data", err);
            setLoading(false);
         }
      };

      fetchDashboardData();
   }, [isAuthenticated]);

   const handleToggleFavorite = async (bookId) => {
      if (!isAuthenticated) {
         toast.error("Vui lòng đăng nhập để lưu yêu thích");
         navigate('/login');
         return;
      }
      try {
         const response = await readerService.toggleFavorite(bookId);
         if (response.data.isFavorite) {
            setFavorites([...favorites, bookId]);
            toast.success("Đã thêm vào yêu thích");
         } else {
            setFavorites(favorites.filter(id => id !== bookId));
            toast.success("Đã xóa khỏi yêu thích");
         }
      } catch (error) {
         toast.error("Có lỗi xảy ra khi cập nhật yêu thích");
      }
   };

   const handleSearch = (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
         navigate(`/books?q=${encodeURIComponent(searchQuery)}`);
      }
   };

   if (loading) {
      return (
         <div className="max-w-7xl mx-auto space-y-12 py-10">
            <div className="h-[500px] bg-slate-100 rounded-[3rem] animate-pulse"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse"></div>)}
            </div>
         </div>
      );
   }

   return (
      <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-24">

         {/* SECTION 1: HERO - SEARCH & BRANDING */}
         <section className="relative min-h-[500px] rounded-[3rem] overflow-hidden bg-slate-900 group">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

            <div className="relative z-10 p-12 md:p-20 flex flex-col justify-center h-full min-h-[500px] space-y-8 max-w-3xl">
               <div className="space-y-4">
                  <span className="px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary-light rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
                     {isAuthenticated ? "Chào mừng bạn quay lại thư viện số" : "Chào mừng đến với hệ thống thư viện iLibrary"}
                  </span>
                  <h1 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                     Khám phá trí tuệ <br />
                     <span className="text-primary italic">Nhân loại.</span>
                  </h1>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
                     Truy cập hàng ngàn đầu sách, tài liệu nghiên cứu và ấn phẩm khoa học mới nhất được cập nhật mỗi ngày.
                  </p>
               </div>

               {/* Main Search Bar */}
               <form onSubmit={handleSearch} className="relative max-w-2xl group/search">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-3xl blur opacity-25 group-focus-within/search:opacity-75 transition duration-500"></div>
                  <div className="relative flex items-center bg-white rounded-2xl p-2 shadow-2xl">
                     <div className="pl-6 text-slate-400">
                        <Search size={24} />
                     </div>
                     <input
                        type="text"
                        placeholder="Tìm kiếm sách, tác giả, mã ISBN..."
                        className="w-full px-6 py-4 bg-transparent text-slate-900 outline-none font-bold text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                     />
                     <button type="submit" className="px-8 py-4 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-slate-900 transition-all">
                        Tìm ngay
                     </button>
                  </div>
               </form>

               <div className="flex flex-wrap gap-8 items-center pt-4">
                  <div className="flex -space-x-4">
                     {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center text-[10px] font-black text-white">
                           {i === 4 ? "+500" : "R"}
                        </div>
                     ))}
                  </div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                     <span className="text-white">1,250+</span> Độc giả đang trực tuyến
                  </p>
               </div>
            </div>
         </section>

         {/* SECTION 2: CATEGORIES BAR */}
         <section className="space-y-8">
            <div className="flex items-end justify-between">
               <div className="space-y-1">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Thể loại phổ biến</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Khám phá kho sách theo chủ đề</p>
               </div>
               <Link to="/books" className="group flex items-center gap-3 text-slate-400 hover:text-primary transition-all font-black text-xs uppercase tracking-widest">
                  Xem tất cả <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-primary group-hover:text-white transition-all"><ArrowRight size={14} /></div>
               </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
               {categories.slice(0, 6).map((cat, i) => (
                  <Link key={i} to={`/books?category=${encodeURIComponent(cat.name || cat)}`} className="group p-8 bg-white border border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 text-center">
                     <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:rotate-12">
                        <Compass size={32} strokeWidth={1.5} />
                     </div>
                     <div>
                        <h3 className="text-sm font-black text-slate-900 group-hover:text-primary transition-colors">{cat.name || cat}</h3>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">{cat.count || 0} sách mới về</p>
                     </div>
                  </Link>
               ))}
            </div>
         </section>

         <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* SECTION 3: NEW ARRIVALS (LATEST BOOKS) */}
            <div className="lg:col-span-3 space-y-10">
               <div className="flex items-end justify-between border-b border-slate-100 pb-6">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                     Sách mới cập nhật
                     <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  </h2>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-10">
                  {newBooks.map((book) => (
                     <BookCard
                        key={book._id}
                        book={book}
                        isAuthenticated={isAuthenticated}
                        isFavorite={favorites.includes(book._id)}
                        onToggleFavorite={(id) => handleToggleFavorite(id)}
                        onBorrow={(b) => navigate(`/books/${b._id}`)}
                        onViewDetails={(id) => navigate(`/books/${id}`)}
                     />
                  ))}
               </div>
            </div>

            {/* SECTION 4: USER PERSONAL QUICK ACCESS */}
            <div className="space-y-10">
               {/* User Stats Summary */}
               {isAuthenticated ? (
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Users size={100} />
                     </div>
                     <div className="relative z-10 space-y-6">
                        <div className="space-y-1">
                           <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Tư cách độc giả</p>
                           <h3 className="text-xl font-black">Trang chủ của {user?.fullName?.split(' ').pop()}</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                              <p className="text-2xl font-black text-primary">{stats.borrowing}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Đang mượn</p>
                           </div>
                           <div className="bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                              <p className="text-2xl font-black text-emerald-400">{stats.returned}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Lịch sử</p>
                           </div>
                        </div>

                        {stats.overdue > 0 && (
                           <div className="bg-rose-500/20 border border-rose-500/30 p-4 rounded-2xl flex items-center gap-4 animate-pulse">
                              <AlertCircle className="text-rose-500" size={20} />
                              <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest">Có {stats.overdue} sách quá hạn!</p>
                           </div>
                        )}

                        <Link to="/reader/history" className="block w-full py-4 bg-primary text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-primary/20 hover:bg-white hover:text-primary transition-all">
                           Quản lý tài khoản
                        </Link>
                     </div>
                  </div>
               ) : (
                  <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
                     {/* Public Signup/Login Prompt */}
                     <div className="relative z-10 space-y-6">
                        <h3 className="text-2xl font-black leading-tight">Trải nghiệm <br />đầy đủ?</h3>
                        <p className="text-white/70 text-sm font-bold leading-relaxed">Đăng nhập để theo dõi lịch sử mượn trả, đặt chỗ sách và nhận thông báo cá nhân.</p>
                        <Link to="/login" className="block w-full py-4 bg-white text-primary text-center rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-900 hover:text-white transition-all">
                           Đăng nhập ngay
                        </Link>
                        <Link to="/register" className="block w-full text-center text-[10px] font-black uppercase tracking-[0.2em] hover:underline">
                           Chưa có tài khoản? Đăng ký
                        </Link>
                     </div>
                  </div>
               )}

               {/* Recent Items Sidebar */}
               {isAuthenticated && (
                  <div className="space-y-6">
                     <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2 flex items-center justify-between">
                        Gần đây nhất
                        <Clock size={14} />
                     </h4>
                     <div className="space-y-4">
                        {recentBorrows.length > 0 ? (
                           recentBorrows.map(item => (
                              <div key={item._id} className="flex items-center gap-4 p-3 bg-white border border-slate-50 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer">
                                 <div className="w-12 h-16 bg-slate-100 rounded-xl overflow-hidden shrink-0">
                                    {item.bookId?.coverImage ? (
                                       <img src={item.bookId.coverImage} className="w-full h-full object-cover" alt="" />
                                    ) : (
                                       <div className="w-full h-full flex items-center justify-center text-slate-300"><Book size={16} /></div>
                                    )}
                                 </div>
                                 <div className="min-w-0">
                                    <h5 className="text-[11px] font-black text-slate-900 truncate group-hover:text-primary transition-colors">{item.bookId?.title}</h5>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{item.status === 'borrowed' ? 'Hạn trả ' : 'Ngày trả '}{new Date(item.dueDate).toLocaleDateString("vi-VN")}</p>
                                 </div>
                              </div>
                           ))
                        ) : (
                           <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Không có dữ liệu</p>
                           </div>
                        )}
                     </div>
                  </div>
               )}

               {/* Info Cards */}

               <div className="bg-amber-50 p-8 rounded-[2.5rem] border border-amber-100 space-y-4">
                  <div className="w-12 h-12 bg-amber-200 rounded-2xl flex items-center justify-center text-amber-700">
                     <Sparkles size={24} />
                  </div>
                  <h4 className="text-sm font-black text-amber-900 uppercase tracking-widest">Nâng cấp tư duy</h4>
                  <p className="text-[11px] text-amber-800/70 font-bold leading-relaxed">
                     Trở thành Reader hạng A+ để được gia hạn sách lên đến 3 lần và mượn tối đa 10 cuốn cùng lúc.
                  </p>
                  <button className="text-[10px] font-black text-amber-700 uppercase tracking-widest hover:underline">Tìm hiểu thêm</button>
               </div>
            </div>
         </div>

      </div>
   );
};

export default HomePage;
