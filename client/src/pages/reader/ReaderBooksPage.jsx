import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { 
  Search, 
  Filter, 
  Book as BookIcon, 
  User, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ShoppingBag,
  Info,
  Calendar,
  X,
  LogIn,
  Hash,
  Globe,
  MapPin,
  Layers,
  ChevronDown,
  Heart
} from "lucide-react";
import bookService from "../../services/bookService";
import categoryService from "../../services/categoryService";
import borrowService from "../../services/borrowService";
import readerService from "../../services/readerService";
import { useAuth } from "../../context/AuthContext";
import { useBasket } from "../../context/BasketContext";
import ConfirmModal from "../../components/common/ConfirmModal";
import BookCard from "../../components/common/BookCard";
import { toast } from "react-hot-toast";

const ReaderBooksPage = () => {
  const { isAuthenticated, user } = useAuth();
  const { basket, addToBasket } = useBasket();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get("search") || "";
  const initialCategory = searchParams.get("category") || "";

  const [books, setBooks] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [favorites, setFavorites] = useState([]);

  const fetchBooks = async () => {
    try {
      const response = await bookService.getAll({ status: 'available' });
      setBooks(response.data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

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
    const fetchData = async () => {
        setLoading(true);
        try {
          const [booksRes, catsRes] = await Promise.all([
            bookService.getAll({ status: 'available' }),
            bookService.getCategories()
          ]);
          setBooks(booksRes.data || []);
          setDbCategories(catsRes.data || []);
          
          if (isAuthenticated) {
            await fetchFavorites();
          }
        } catch (error) {
          console.error("Error fetching books data:", error);
        } finally {
          setLoading(false);
        }
    };
    fetchData();
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

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || 
                           (book.categoryId?._id === selectedCategory || book.categoryId === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">

      {/* Header & Control Bar */}
      <div className="flex flex-col gap-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
                <h1 className="text-4xl font-bold text-gray-900 leading-none mb-3">Kho sách tri thức</h1>
                <p className="text-gray-400 font-semibold text-sm italic">Khám phá và tìm kiếm những nguồn học liệu quý giá dành cho bạn.</p>
            </div>
            <div className="flex gap-3">
                 <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm tài liệu..."
                        className="w-full md:w-80 pl-11 pr-5 py-4 bg-neutral-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-semibold"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="appearance-none h-14 pl-12 pr-10 bg-neutral-white border-2 border-gray-100 rounded-2xl text-sm font-bold text-gray-500 focus:outline-none focus:border-primary transition-all cursor-pointer shadow-sm shadow-gray-100 min-w-[200px]"
                    >
                        <option value="">Tất cả thể loại</option>
                        {dbCategories.map(cat => (
                            <option key={cat._id} value={cat._id}>{cat.name} ({cat.count})</option>
                        ))}
                    </select>
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                </div>
            </div>
        </div>

        {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-80 animate-pulse"></div>
            ))}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredBooks.map((book) => (
                <BookCard 
                    key={book._id}
                    book={book}
                    isAuthenticated={isAuthenticated}
                    isFavorite={favorites.includes(book._id)}
                    onToggleFavorite={(id) => handleToggleFavorite(id)}
                    onBorrow={addToBasket}
                    onViewDetails={(id) => navigate(`/books/${id}`)}
                />
            ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default ReaderBooksPage;

