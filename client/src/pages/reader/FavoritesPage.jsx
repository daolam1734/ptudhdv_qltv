import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { 
  Heart, 
  Book as BookIcon, 
  ShoppingBag, 
  User, 
  ArrowLeft,
  Trash2
} from "lucide-react";
import readerService from "../../services/readerService";
import borrowService from "../../services/borrowService";
import { useAuth } from "../../context/AuthContext";
import ConfirmModal from "../../components/common/ConfirmModal";
import BookCard from "../../components/common/BookCard";
import { toast } from "react-hot-toast";

const FavoritesPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [borrowingBook, setBorrowingBook] = useState(null);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await readerService.getFavorites();
            setFavorites(response.data || []);
        } catch (error) {
            console.error("Error fetching favorites:", error);
            toast.error("Không thể tải danh sách yêu thích");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }
        fetchFavorites();
    }, [isAuthenticated, navigate]);

    const handleRemoveFavorite = async (bookId) => {
        try {
            await readerService.toggleFavorite(bookId);
            setFavorites(favorites.filter(book => book._id !== bookId));
            toast.success(" Đã xóa khỏi danh sách yêu thích");
        } catch (error) {
            toast.error("Có lỗi xảy ra");
        }
    };

    const handleBorrow = async (bookId) => {
        try {
            await borrowService.create({ bookId });
            toast.success("Gửi yêu cầu mượn sách thành công! Vui lòng chờ quản thủ thư duyệt.");
            setBorrowingBook(null);
        } catch (error) {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi mượn sách");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-sm mb-2"
                    >
                        <ArrowLeft size={16} /> Quay lại
                    </button>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Sách Yêu Thích</h2>
                    <p className="text-gray-500 font-medium">Danh sách những cuốn sách bạn đã lưu để đọc sau.</p>
                </div>
                <div className="bg-rose-50 p-4 rounded-2xl flex items-center gap-3 border border-rose-100">
                    <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-rose-200">
                        <Heart size={20} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-500">Tổng cộng</p>
                        <p className="text-xl font-black text-rose-600 leading-none">{favorites.length} cuốn</p>
                    </div>
                </div>
            </div>

            {favorites.length === 0 ? (
                <div className="bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200 py-20 px-4 text-center">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-gray-100">
                        <Heart size={40} className="text-gray-200" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">Chưa có sách yêu thích</h3>
                    <p className="text-gray-500 font-medium mb-8 max-w-sm mx-auto">Hãy khám phá kho sách và lưu lại những cuốn sách hay mà bạn muốn đọc nhé!</p>
                    <Link 
                        to="/books" 
                        className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                    >
                        <BookIcon size={18} /> Khám phá kho sách
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {favorites.map((book) => (
                        <BookCard 
                            key={book._id}
                            book={book}
                            isAuthenticated={isAuthenticated}
                            isFavorite={true}
                            onToggleFavorite={(id) => handleRemoveFavorite(id)}
                            onBorrow={setBorrowingBook}
                            onViewDetails={(id) => navigate(`/books/${id}`)}
                        />
                    ))}
                </div>
            )}

            <ConfirmModal 
                isOpen={!!borrowingBook}
                onClose={() => setBorrowingBook(null)}
                onConfirm={() => handleBorrow(borrowingBook?._id)}
                title="Xác nhận mượn sách"
                message={`Bạn có chắc chắn muốn mượn cuốn "${borrowingBook?.title}" không?`}
                confirmText="Xác nhận"
            />
        </div>
    );
};

export default FavoritesPage;
