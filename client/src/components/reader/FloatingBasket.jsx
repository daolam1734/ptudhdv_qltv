import React from "react";
import { ShoppingBag, Trash2, Book as BookIcon, X } from "lucide-react";

const FloatingBasket = ({ basket, onRemove, onClear, onSubmit, isOpen, setIsOpen }) => {
  const selectedItems = basket.filter(item => item.selected);
  const totalCount = selectedItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  if (basket.length === 0) return null;

  return (
    <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end gap-4">
      {isOpen ? (
        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-[380px] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <ShoppingBag size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-widest">Tủ sách của bạn</h3>
                <p className="text-[10px] text-slate-400 font-bold">{basket.length} đầu sách - {totalCount} cuốn</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="max-h-[350px] overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {basket.map((item) => (
              <div key={item.book._id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-[1.5rem] border border-slate-100 group">
                <div className="w-14 h-20 bg-white rounded-xl shadow-sm overflow-hidden flex-shrink-0 border border-slate-200">
                  {item.book.coverImage ? (
                    <img src={item.book.coverImage} alt={item.book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                      <BookIcon size={20} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm truncate">{item.book.title}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">SL: {item.quantity || 1} cuốn</p>
                </div>
                <button 
                  onClick={() => onRemove(item.book._id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="p-6 bg-white border-t border-slate-100 mt-auto">
             <div className="flex gap-3">
                <button 
                  onClick={onClear}
                  className="px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
                >
                  Xóa hết
                </button>
                <button 
                  onClick={onSubmit}
                  className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  Gửi yêu cầu mượn
                </button>
             </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default FloatingBasket;
