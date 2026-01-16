import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBasket } from '../../context/BasketContext';
import { useAuth } from '../../context/AuthContext';
import borrowService from '../../services/borrowService';
import { 
  ShoppingBag, 
  Trash2, 
  Book as BookIcon, 
  ArrowLeft, 
  Plus, 
  Minus, 
  CheckCircle2, 
  AlertCircle,
  Library,
  Info
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const BasketPage = () => {
  const { basket, removeFromBasket, clearBasket, updateQuantity, toggleSelection } = useBasket();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const selectedItems = basket.filter(item => item.selected);
  const totalCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một cuốn sách để mượn");
      return;
    }
    
    const bookIds = [];
    selectedItems.forEach(item => {
        for (let i = 0; i < item.quantity; i++) {
            bookIds.push(item.book._id);
        }
    });

    try {
      const res = await borrowService.create({ bookIds });
      
      if (res.success) {
        toast.success(`Đã gửi yêu cầu mượn ${bookIds.length} cuốn sách thành công!`, {
          duration: 5000,
          icon: '📚'
        });
        clearBasket();
        navigate('/reader/history');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi hệ thống khi mượn sách");
    }
  };

  if (basket.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 border border-slate-100 shadow-inner">
          <ShoppingBag size={48} strokeWidth={1} />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight transition-all">Tủ sách trống rỗng</h2>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Bạn chưa chọn cuốn sách nào để mượn</p>
        </div>
        <Link 
          to="/books" 
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          Khám phá kho sách
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-100 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter italic">Chi tiết tủ sách</h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Quản lý các đầu sách bạn chuẩn bị mượn</p>
          </div>
        </div>
        <button 
          onClick={clearBasket}
          className="px-6 py-3 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-rose-100 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
        >
          Xóa toàn bộ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* List Section */}
        <div className="lg:col-span-2 space-y-4">
          {basket.map((item) => (
            <div key={item.book._id} className={`bg-white rounded-[2rem] border p-6 flex flex-col sm:flex-row items-center gap-6 group transition-all duration-500 ${item.selected ? 'border-primary shadow-2xl shadow-primary/5' : 'border-slate-100 opacity-70'}`}>
              <div className="flex items-center">
                 <input 
                    type="checkbox" 
                    checked={item.selected} 
                    onChange={() => toggleSelection(item.book._id)}
                    className="w-6 h-6 rounded-lg border-2 border-slate-200 text-primary focus:ring-primary cursor-pointer transition-all"
                 />
              </div>

              <div className="w-24 h-36 bg-slate-50 rounded-2xl overflow-hidden shadow-md flex-shrink-0 border border-slate-200">
                {item.book.coverImage ? (
                  <img src={item.book.coverImage} alt={item.book.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <BookIcon size={32} />
                  </div>
                )}
              </div>
              
              <div className="flex-1 text-center sm:text-left space-y-2">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[9px] font-black uppercase rounded-lg tracking-widest">
                  {item.book.categoryId?.name || item.book.category || "Tổng hợp"}
                </span>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{item.book.title}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{item.book.author}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 text-[10px] font-black text-emerald-500 bg-emerald-50 w-fit px-3 py-1.5 rounded-xl border border-emerald-100">
                    <CheckCircle2 size={12} />
                    <span>CÒN {item.book.available || item.book.quantity} CUỐN SẴN CÓ</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4 min-w-[120px]">
                <div className="flex items-center bg-slate-100 rounded-2xl p-1 border border-slate-200 shadow-inner">
                  <button 
                    onClick={() => updateQuantity(item.book._id, -1)}
                    className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all shadow-none hover:shadow-sm"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-10 text-center font-black text-slate-900">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.book._id, 1)}
                    className="p-2 hover:bg-white rounded-xl text-slate-500 transition-all shadow-none hover:shadow-sm"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => removeFromBasket(item.book._id)}
                  className="text-[10px] font-black text-rose-400 hover:text-rose-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 size={12} />
                  <span>Xóa khỏi tủ</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary Section */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/30 sticky top-24">
            <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/10 pb-6 italic">Tóm tắt yêu cầu</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-white/60 uppercase tracking-tighter">Đang chọn:</span>
                <span className="text-xl">{selectedItems.length} đầu sách</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold">
                <span className="text-white/60 uppercase tracking-tighter">Tổng số cuốn mượn:</span>
                <span className="text-3xl font-black text-primary">{totalCount}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-4 border-t border-white/10">
                <span className="text-white/60 uppercase tracking-tighter">Thời gian mượn:</span>
                <span className="text-right">14 ngày<br/><span className="text-[10px] text-emerald-400">(Tự động gia hạn 1 lần)</span></span>
              </div>
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3 mb-8">
                <div className="flex gap-3 text-[11px] font-bold text-white/70 leading-relaxed">
                    <Info size={16} className="shrink-0 text-primary" />
                    <p>Yêu cầu sẽ được gửi tới thủ thư. Vui lòng đến nhận sách trong vòng 24h sau khi được duyệt.</p>
                </div>
            </div>

            <button 
              onClick={handleCheckout}
              disabled={totalCount > 5}
              className={`w-full py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                totalCount > 5 
                ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
                : "bg-primary text-white hover:bg-white hover:text-slate-900 shadow-primary/20"
              }`}
            >
              <Library size={18} />
              Gửi yêu cầu mượn
            </button>

            <Link 
              to="/books"
              className="w-full mt-4 py-4 rounded-[1.5rem] bg-white/10 text-white/60 font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-white/20 hover:text-white transition-all"
            >
              <Plus size={14} />
              Chọn thêm sách mượn
            </Link>
            
            {totalCount > 5 && (
                 <p className="text-rose-400 text-[10px] font-black text-center mt-4 flex items-center justify-center gap-1.5 uppercase">
                    <AlertCircle size={12} />
                    Vượt quá hạn mức 5 cuốn
                 </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasketPage;
