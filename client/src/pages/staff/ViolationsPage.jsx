import React, { useState, useEffect } from 'react';
import readerService from '../../services/readerService';
import violationService from '../../services/violationService';
import { 
  CreditCard, 
  Search, 
  User, 
  AlertCircle,
  CheckCircle,
  Filter,
  DollarSign,
  Search as SearchIcon,
  ArrowUpRight,
  TrendingDown,
  Wallet,
  Calendar,
  ShieldAlert,
  Zap,
  ChevronRight,
  History,
  Info,
  Clock,
  XCircle,
  ArrowDownCircle,
  FileText
} from 'lucide-react';

const ViolationsPage = () => {
  const [activeTab, setActiveTab] = useState('debtors');
  const [readers, setReaders] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReader, setSelectedReader] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (activeTab === 'debtors') {
      fetchViolatedReaders();
    } else {
      fetchViolations();
    }
  }, [activeTab, page]);

  const fetchViolatedReaders = async () => {
    try {
      setLoading(true);
      const res = await readerService.getAll({ hasDebt: true, limit: 100 });
      setReaders(res.data);
    } catch (err) {
      console.error('Failed to fetch readers', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    try {
      setLoading(true);
      const res = await violationService.getAll({ page, limit: 10 });
      setViolations(res.data);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch violations', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayViolation = async (e) => {
    e.preventDefault();
    if (!selectedReader || !payAmount) return;

    try {
      const amount = parseInt(payAmount);
      await readerService.payViolation(selectedReader._id, amount);
      setMessage({ type: 'success', text: `Đã thanh toán ${amount.toLocaleString()}đ cho độc giả ${selectedReader.fullName}` });
      setSelectedReader(null);
      setPayAmount('');
      
      if (activeTab === 'debtors') fetchViolatedReaders();
      else fetchViolations();

      setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Lỗi khi thanh toán' });
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      'unpaid': 'bg-amber-50 text-amber-600 border-amber-100',
      'paid': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'cancelled': 'bg-gray-50 text-gray-500 border-gray-100',
      'chưa thanh toán': 'bg-amber-50 text-amber-600 border-amber-100',
      'đã thanh toán': 'bg-emerald-50 text-emerald-600 border-emerald-100',
      'đã hủy': 'bg-gray-50 text-gray-500 border-gray-100'
    };
    return (
      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[status] || styles['unpaid']}`}>
         {status.toUpperCase()}
      </span>
    );
  };

  const filteredReaders = readers.filter(r => 
    r.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.idCard?.includes(searchTerm)
  );

  if (loading) return (
    <div className='flex flex-col items-center justify-center py-40 space-y-6'>
      <div className='relative'>
          <div className='w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full animate-spin'></div>
          <CreditCard className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary' size={24} />
      </div>
      <p className='text-gray-400 font-black uppercase tracking-[0.3em] text-[10px]'>Đang truy xuất dữ liệu tài chính...</p>
    </div>
  );

  return (
    <div className='space-y-8 animate-in fade-in duration-500 pb-20'>
      <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 tracking-tight'>Quản lý Vi phạm</h1>
          <p className='text-gray-500 font-medium mt-1'>Thu phí quá hạn và bồi thường sách</p>
        </div>
        <div className='flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm'>
          <div className='text-right hidden sm:block'>
            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right'>Tổng nợ tồn</p>
            <p className='text-xl font-extrabold text-primary'>
               {readers.reduce((acc, r) => acc + (r.unpaidViolations || 0), 0).toLocaleString()}đ
            </p>
          </div>
          <div className='w-px h-10 bg-gray-100 hidden sm:block'></div>
          <div className='p-3 bg-primary-light/20 rounded-xl text-primary shadow-sm shadow-primary/10'>
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top duration-300 ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className='text-emerald-500' size={24} /> : <ShieldAlert className='text-red-500' size={24} />}
          <p className='font-bold text-sm tracking-tight'>{message.text}</p>
        </div>
      )}

      <div className='flex border-b border-gray-100 overflow-x-auto no-scrollbar bg-white rounded-xl px-2'>
        {[
          { id: 'debtors', label: 'Độc giả nợ phí', icon: <Wallet size={16} /> },
          { id: 'history', label: 'Lịch sử vi phạm', icon: <History size={16} /> }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setPage(1); }}
              className={`px-6 py-4 text-sm font-bold transition-all relative whitespace-nowrap flex items-center gap-2 ${isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              {tab.icon}
              {tab.label}
              {isActive && (
                <div className='absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full'></div>
              )}
            </button>
          );
        })}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
        <div className='lg:col-span-2 space-y-6'>
            {activeTab === 'debtors' ? (
              <>
                <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                    <h3 className='text-lg font-bold text-gray-900'>Danh sách nợ phí</h3>
                    <div className='relative group w-full md:w-72'>
                        <SearchIcon className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors' size={18} />
                        <input 
                          type='text'
                          placeholder='Tìm độc giả...'
                          className='w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-medium'
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className='bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden'>
                    <table className='w-full text-left border-collapse'>
                      <thead>
                        <tr className='bg-gray-50/80 border-b border-gray-100'>
                           <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider'>Độc giả</th>
                           <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right'>Số tiền nợ</th>
                           <th className='px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center'>Mức độ</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-gray-100'>
                        {filteredReaders.map((reader) => (
                          <tr 
                            key={reader._id} 
                            onClick={() => setSelectedReader(reader)}
                            className={`group cursor-pointer transition-all ${selectedReader?._id === reader._id ? 'bg-primary-light/10' : 'hover:bg-gray-50/30'}`}
                          >
                            <td className='px-6 py-5'>
                               <div className='flex items-center gap-4'>
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm transition-all ${selectedReader?._id === reader._id ? 'bg-primary text-white shadow-lg shadow-indigo-100' : 'bg-primary-light/10 text-primary'}`}>
                                     {reader.fullName?.charAt(0)}
                                  </div>
                                  <div>
                                     <p className='font-bold text-gray-900 group-hover:text-primary transition-colors'>{reader.fullName}</p>
                                     <p className='text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5'>{reader.idCard}</p>
                                  </div>
                               </div>
                            </td>
                            <td className='px-6 py-5 text-right font-bold text-xl text-gray-900 tabular-nums'>
                               {reader.unpaidViolations?.toLocaleString()} <span className='text-[10px] text-gray-400 font-medium'>đ</span>
                            </td>
                            <td className='px-6 py-5'>
                               <div className='flex justify-center'>
                                  <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${reader.unpaidViolations > 100000 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                                     {reader.unpaidViolations > 100000 ? 'Nghiêm trọng' : 'Chờ xử lý'}
                                  </span>
                               </div>
                            </td>
                          </tr>
                        ))}
                        {filteredReaders.length === 0 && (
                            <tr>
                                <td colSpan='3' className='px-6 py-20 text-center'>
                                    <CheckCircle size={48} className='mx-auto text-emerald-100 mb-4' />
                                    <p className='text-gray-400 font-bold italic'>Không có độc giả nào nợ phí.</p>
                                </td>
                            </tr>
                        )}
                      </tbody>
                    </table>
                </div>
              </>
            ) : (
              <>
                 <div className='flex items-center justify-between'>
                    <h3 className='text-lg font-bold text-gray-900'>Chi tiết các vi phạm</h3>
                    <p className='text-xs font-bold text-gray-400 px-3 py-1 bg-gray-50 rounded-lg'>Tổng: {pagination.total || 0}</p>
                 </div>

                 <div className='space-y-4'>
                    {violations.map((v) => (
                      <div key={v._id} className='bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group'>
                         <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                            <div className='flex gap-4'>
                               <div className='w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/5 group-hover:text-primary transition-colors'>
                                  <ShieldAlert size={24} />
                               </div>
                               <div>
                                  <div className='flex items-center gap-2'>
                                     <h5 className='font-black text-gray-900 leading-none'>{v.readerId?.fullName || 'N/A'}</h5>
                                     {getStatusBadge(v.status)}
                                  </div>
                                  <p className='text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest flex items-center gap-2'>
                                     <Calendar size={12} /> {new Date(v.createdAt).toLocaleDateString('vi-VN')} 
                                     <span className='w-1 h-1 bg-gray-300 rounded-full'></span>
                                     <Info size={12} /> {v.reason}
                                  </p>
                               </div>
                            </div>
                            <div className='text-right'>
                               <p className='text-xl font-black text-red-600'>-{v.amount?.toLocaleString()}đ</p>
                               <p className='text-[10px] font-bold text-gray-400 mt-1 italic max-w-[200px] truncate'>{v.description}</p>
                            </div>
                         </div>
                         {v.borrowId && (
                           <div className='mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between'>
                              <div className='flex items-center gap-2 text-[10px] font-bold text-primary px-3 py-1 bg-primary/5 rounded-lg'>
                                 <FileText size={12} /> Phiếu mượn: {typeof v.borrowId === 'object' ? (v.borrowId.status || 'Đang xử lý') : (v.borrowId.substring(v.borrowId.length - 8).toUpperCase())}
                              </div>
                              {v.status === 'đã thanh toán' && v.paidAt && (
                                <div className='flex items-center gap-2 text-[10px] font-bold text-emerald-600'>
                                   <Clock size={12} /> Đã trả lúc {new Date(v.paidAt).toLocaleDateString('vi-VN')}
                                </div>
                              )}
                           </div>
                         )}
                      </div>
                    ))}
                    {violations.length === 0 && (
                       <div className='py-20 text-center bg-white rounded-2xl border border-dashed border-gray-200'>
                          <History size={48} className='mx-auto text-gray-100 mb-4' />
                          <p className='text-gray-400 font-bold italic'>Chưa có lịch sử vi phạm nào được ghi nhận.</p>
                       </div>
                    )}

                    {pagination.totalPages > 1 && (
                      <div className='flex justify-center gap-2 mt-4'>
                         {[...Array(pagination.totalPages)].map((_, i) => (
                           <button 
                             key={i} 
                             onClick={() => setPage(i + 1)}
                             className={`w-8 h-8 rounded-lg font-bold text-xs ${page === i + 1 ? 'bg-primary text-white' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
                           >
                             {i + 1}
                           </button>
                         ))}
                      </div>
                    )}
                 </div>
              </>
            )}
        </div>

        <div className='space-y-6 lg:sticky lg:top-8'>
            <h3 className='text-lg font-bold text-gray-900'>Thanh toán</h3>
            <div className='bg-white p-8 rounded-2xl border border-gray-100 shadow-sm'>
                {selectedReader ? (
                    <form onSubmit={handlePayViolation} className='space-y-6 animate-in fade-in slide-in-from-bottom duration-300'>
                        <div className='p-4 bg-gray-50 rounded-xl border border-gray-100'>
                            <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3'>Người thanh toán</p>
                            <div className='flex items-center gap-3'>
                                <div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center font-bold text-white shadow-sm'>
                                    {selectedReader.fullName?.charAt(0)}
                                </div>
                                <div>
                                    <p className='font-bold text-gray-900 leading-none'>{selectedReader.fullName}</p>
                                    <p className='text-[10px] font-bold text-primary mt-1 uppercase tracking-wider'>Nợ: {selectedReader.unpaidViolations?.toLocaleString()}đ</p>
                                </div>
                            </div>
                        </div>

                        <div className='space-y-2'>
                            <label className='text-xs font-bold text-gray-500 uppercase tracking-wider ml-1'>Số tiền thu (VND)</label>
                            <input 
                                type='number'
                                className='w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-2xl font-bold text-gray-900 tabular-nums'
                                placeholder='0'
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                required
                            />
                        </div>

                        <div className='space-y-3 pt-2'>
                            <button 
                                type='submit'
                                className='w-full bg-primary text-white py-4 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/10 active:scale-[0.98] flex items-center justify-center gap-2'
                            >
                                <DollarSign size={18} />
                                Xác nhận thanh toán
                            </button>
                            <button 
                                type='button'
                                onClick={() => setSelectedReader(null)}
                                className='w-full bg-white text-gray-500 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all border border-gray-200'
                            >
                                Hủy giao dịch
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className='py-16 text-center space-y-4'>
                        <div className='w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto text-gray-300'>
                             <User size={24} />
                        </div>
                        <p className='text-xs font-bold text-gray-400 uppercase tracking-wider max-w-[180px] mx-auto leading-relaxed'>Vui lòng chọn độc giả từ danh sách để thực hiện thu phí.</p>
                    </div>
                )}
            </div>
        </div>
      </div>

    </div>
  );
};

export default ViolationsPage;
