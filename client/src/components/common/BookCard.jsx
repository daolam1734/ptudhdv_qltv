import React from "react";
import { Link } from "react-router-dom";
import { 
  Book as BookIcon, 
  ShoppingBag, 
  User, 
  LogIn,
  Heart,
  Star,
  Layers
} from "lucide-react";

/**
 * Shared BookCard component to ensure consistent UI across the application.
 */
const BookCard = ({ 
  book, 
  isAuthenticated, 
  isFavorite, 
  onToggleFavorite, 
  onBorrow, 
  onViewDetails,
  showBorrowButton = true 
}) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary/15 hover:-translate-y-2 transition-all duration-500 group flex flex-col h-full relative w-full mx-auto">
      {/* Cover Image Section */}
      <div className="aspect-[3/4] bg-slate-50 relative overflow-hidden m-4 rounded-[2rem] shadow-inner ring-1 ring-slate-100">
        {book.coverImage ? (
          <img 
            src={book.coverImage} 
            alt={book.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            <BookIcon size={48} strokeWidth={1} className="opacity-20" />
            <span className="text-[10px] mt-3 font-black uppercase tracking-widest text-slate-300">Không có ảnh</span>
          </div>
        )}

        {/* Floating Heart Button */}
        <div className="absolute top-4 right-4 z-20">
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(book._id);
            }}
            className={`p-3 rounded-2xl backdrop-blur-md shadow-2xl transition-all active:scale-90 border ${
              isFavorite 
                ? "bg-rose-500 border-rose-400 text-white" 
                : "bg-white/90 border-white text-slate-400 hover:text-rose-500"
            }`}
          >
            <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center p-6 backdrop-blur-[1px]">
          <button 
            onClick={() => onViewDetails(book._id)}
            className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl scale-90 group-hover:scale-100 transition-all duration-500 hover:bg-primary hover:text-white"
          >
            Chi tiết sách
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="px-8 pb-8 pt-2 flex-1 flex flex-col">
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg tracking-widest">
              {book.category || "Tổng hợp"}
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-500">
              <Star size={12} fill="currentColor" />
              <span>5.0</span>
            </div>
          </div>
          
          <Link to={`/books/${book._id}`}>
            <h3 className="font-bold text-slate-900 line-clamp-2 min-h-[3.2rem] leading-[1.4] group-hover:text-primary transition-colors text-lg tracking-tight">
              {book.title}
            </h3>
          </Link>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-400">
              <div className="w-6 h-6 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                <User size={12} className="text-primary" />
              </div>
              <span className="truncate max-w-[140px]">{book.author}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 bg-slate-100/50 px-2.5 py-1.5 rounded-xl border border-slate-100">
              <Layers size={12} className="text-primary" />
              <span>{book.quantity || 0}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        {showBorrowButton && (
          isAuthenticated ? (
            <button
              onClick={() => onBorrow(book)}
              disabled={book.available === 0}
              className={`mt-auto w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all shadow-xl ${
                book.available > 0 
                  ? "bg-slate-900 text-white hover:bg-primary hover:shadow-primary/25 active:scale-95" 
                  : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
              }`}
            >
              <ShoppingBag size={16} strokeWidth={2.5} />
              Đăng ký mượn
            </button>
          ) : (
            <button
              onClick={() => onViewDetails(book._id)}
              className="mt-auto w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 bg-slate-100 text-slate-600 hover:bg-slate-900 hover:text-white transition-all active:scale-95"
            >
              <LogIn size={16} strokeWidth={2.5} />
              Đăng nhập ngay
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default BookCard;
