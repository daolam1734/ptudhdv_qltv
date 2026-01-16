import React from "react";
import { 
  X, 
  Book, 
  User, 
  Calendar, 
  FileText, 
  Printer, 
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  MapPin,
  Hash,
  Info
} from "lucide-react";

const BorrowSlipModal = ({ isOpen, onClose, borrow }) => {
  if (!isOpen || !borrow) return null;

  const getStatusInfo = (status) => {
    const map = {
      pending: { label: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-50" },
      approved: { label: "Sẵn sàng lấy", color: "text-indigo-600", bg: "bg-indigo-50" },
      borrowed: { label: "Đang mượn", color: "text-blue-600", bg: "bg-blue-50" },
      overdue: { label: "Quá hạn", color: "text-rose-600", bg: "bg-rose-50" },
      returned: { label: "Đã trả", color: "text-emerald-600", bg: "bg-emerald-50" },
      cancelled: { label: "Đã hủy", color: "text-gray-500", bg: "bg-gray-50" },
      rejected: { label: "Bị từ chối", color: "text-red-500", bg: "bg-red-50" },
      lost: { label: "Mất sách", color: "text-neutral-600", bg: "bg-neutral-100" },
      'đang chờ': { label: "Chờ duyệt", color: "text-amber-600", bg: "bg-amber-50" },
      'đã duyệt': { label: "Sẵn sàng lấy", color: "text-indigo-600", bg: "bg-indigo-50" },
      'đang mượn': { label: "Đang mượn", color: "text-blue-600", bg: "bg-blue-50" },
      'quá hạn': { label: "Quá hạn", color: "text-rose-600", bg: "bg-rose-50" },
      'đã trả': { label: "Đã trả", color: "text-emerald-600", bg: "bg-emerald-50" },
      'đã trả (vi phạm)': { label: "Đã trả (Có vi phạm)", color: "text-amber-600", bg: "bg-amber-50" },
      'đã hủy': { label: "Đã hủy", color: "text-gray-500", bg: "bg-gray-50" },
      'từ chối': { label: "Bị từ chối", color: "text-red-500", bg: "bg-red-50" },
      'làm mất': { label: "Mất sách", color: "text-neutral-600", bg: "bg-neutral-100" }
    };
    return map[status] || { label: status, color: "text-gray-600", bg: "bg-gray-50" };
  };

  const status = getStatusInfo(borrow.status);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
        {/* Header - Decorated */}
        <div className="bg-neutral-light/30 px-8 py-6 flex justify-between items-center border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black text-neutral-dark tracking-tight">PHIẾU MƯỢN SÁCH</h3>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Mã số: {borrow._id.substring(borrow._id.length - 8).toUpperCase()}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-gray-600 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Main Info Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-neutral-light/20 rounded-3xl border border-gray-50">
             <div className="flex items-center gap-3">
                <div className={`${status.bg} ${status.color} px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-current opacity-80`}>
                   {status.label}
                </div>
                {(borrow.status === 'overdue' || borrow.status === 'quá hạn') && (
                  <span className="flex items-center gap-1 text-rose-600 text-[10px] font-black uppercase ring-1 ring-rose-600/20 px-2 py-1 rounded">
                    <AlertCircle size={12} /> Cần trả ngay
                  </span>
                )}
             </div>
             <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thời gian tạo phiếu</p>
                <p className="text-sm font-bold text-neutral-dark">{new Date(borrow.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Book Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Book size={14} className="text-primary" /> Thông tin tài liệu
              </h4>
              <div className="bg-white p-4 rounded-2xl border border-gray-100 flex gap-4 shadow-sm">
                <div className="w-20 h-28 bg-neutral-light rounded-lg overflow-hidden flex-shrink-0 shadow-inner">
                  {borrow.bookId?.coverImage ? (
                    <img src={borrow.bookId.coverImage} className="w-full h-full object-cover" alt="" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                       <Book size={32} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-black text-neutral-dark text-sm line-clamp-2 leading-tight mb-1">{borrow.bookId?.title}</p>
                  <p className="text-xs text-gray-500 font-medium mb-2">{borrow.bookId?.author}</p>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 bg-neutral-light rounded text-[10px] font-bold text-gray-400">
                    <Hash size={10} /> {borrow.bookId?.isbn || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Reader Section */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} className="text-primary" /> Thông tin độc giả
              </h4>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 space-y-3 shadow-sm">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Họ và tên</p>
                  <p className="text-sm font-black text-neutral-dark underline decoration-primary/30 decoration-2 underline-offset-2">{borrow.readerId?.fullName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Số thẻ / CCCD</p>
                    <p className="text-xs font-bold text-neutral-dark">{borrow.readerId?.idCard || borrow.readerId?.username}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Số điện thoại</p>
                    <p className="text-xs font-bold text-neutral-dark">{borrow.readerId?.phone || 'Chưa cập nhật'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline / Dates */}
          <div className="space-y-4">
             <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} className="text-primary" /> Lịch trình lưu thông
             </h4>
             <div className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm overflow-hidden relative">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative z-10">
                   <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                         <Bookmark size={10} /> Ngày mượn
                      </p>
                      <p className="text-sm font-black text-neutral-dark">
                         {borrow.borrowDate ? new Date(borrow.borrowDate).toLocaleDateString('vi-VN') : '---'}
                      </p>
                   </div>
                   <div className="space-y-1 p-3 bg-primary/5 rounded-2xl border border-primary/10">
                      <p className="text-[10px] text-primary font-bold uppercase mb-1 flex items-center gap-1">
                         <Clock size={10} /> Hạn trả dự kiến
                      </p>
                      <p className="text-sm font-black text-primary">
                         {borrow.dueDate ? new Date(borrow.dueDate).toLocaleDateString('vi-VN') : '---'}
                      </p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-bold uppercase mb-1 flex items-center gap-1">
                         <CheckCircle2 size={10} /> Ngày trả thực tế
                      </p>
                      <p className="text-sm font-black text-neutral-dark">
                         {borrow.returnDate ? new Date(borrow.returnDate).toLocaleDateString('vi-VN') : '---'}
                      </p>
                   </div>
                </div>
                {/* Connect Line (Visual) */}
                <div className="hidden sm:block absolute top-[2.75rem] left-[15%] right-[15%] h-px bg-dashed-primary opacity-20"></div>
             </div>
          </div>

          {/* Additional Info (Violations, Notes) */}
          {(borrow.violation || borrow.notes) && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14} className="text-primary" /> Ghi chú & Vi phạm
              </h4>
              <div className="bg-neutral-light/10 rounded-2xl p-5 border border-dashed border-gray-200">
                {borrow.notes && (
                  <div className="mb-4 last:mb-0">
                    <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">Ghi chú nghiệp vụ</p>
                    <p className="text-xs text-neutral-dark font-medium italic">"{borrow.notes}"</p>
                  </div>
                )}
                {borrow.violation && (
                  <div className="p-4 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-rose-500 font-bold uppercase mb-0.5">Phí vi phạm phát sinh</p>
                      <p className="text-sm font-black text-rose-600 capitalize">{borrow.violation.reason}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-rose-600">{borrow.violation.amount?.toLocaleString()}đ</p>
                       <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${borrow.violation.isPaid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {borrow.violation.isPaid ? 'Đã thanh toán' : 'Chưa thu phí'}
                       </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Rules / Footer */}
          <div className="pt-4 border-t border-gray-50">
             <div className="flex items-start gap-3 bg-blue-50/50 p-4 rounded-2xl">
                <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-blue-600/80 leading-relaxed font-medium">
                   <strong>Lưu ý:</strong> Độc giả vui lòng trả sách đúng hạn để tránh phát sinh phí phạt (5.000đ/ngày). Sách hư hỏng hoặc mất sẽ phải bồi thường theo quy định của Thư viện.
                </p>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-white p-8 border-t border-gray-100 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <button 
                 onClick={() => window.print()}
                 className="flex items-center gap-2 px-5 py-2.5 bg-neutral-light text-neutral-dark hover:bg-gray-100 rounded-xl text-xs font-bold transition-all shadow-sm"
              >
                 <Printer size={16} /> In phiếu
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 bg-neutral-light text-neutral-dark hover:bg-gray-100 rounded-xl text-xs font-bold transition-all shadow-sm">
                 <Download size={16} /> Tải PDF
              </button>
           </div>
           <button 
             onClick={onClose}
             className="px-8 py-2.5 bg-primary text-white rounded-xl text-xs font-black shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all uppercase tracking-wider"
           >
              Đóng lại
           </button>
        </div>
      </div>
    </div>
  );
};

export default BorrowSlipModal;
