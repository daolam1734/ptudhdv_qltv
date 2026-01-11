import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Plus, RotateCcw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const BorrowsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchRecords();
  }, [page]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await api.borrow.getAll({ page, limit: 10 });
      setRecords(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch records', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async (id) => {
    if (window.confirm('Mark this book as returned?')) {
      try {
        await api.borrow.returnBook({ borrowId: id });
        fetchRecords();
      } catch (err) {
        alert(err.message || 'Failed to return book');
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'borrowed': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit"><Clock size={12}/> Borrowed</span>;
      case 'overdue': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Overdue</span>;
      case 'returned': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs flex items-center gap-1 w-fit"><CheckCircle size={12}/> Returned</span>;
      default: return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Borrowing Records</h2>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <Plus size={18} />
          <span>New Borrow</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Book</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Reader</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fine</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.bookId?.title}</div>
                  <div className="text-xs text-gray-500">ISBN: {record.bookId?.isbn}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{record.readerId?.fullName}</div>
                  <div className="text-xs text-gray-500">{record.readerId?.username}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  <div>Borrowed: {new Date(record.borrowDate).toLocaleDateString()}</div>
                  <div className={record.status === 'overdue' ? 'text-red-500 font-medium' : ''}>Due: {new Date(record.dueDate).toLocaleDateString()}</div>
                  {record.returnDate && <div className="text-green-600">Returned: {new Date(record.returnDate).toLocaleDateString()}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(record.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.fine?.amount > 0 ? (
                    <span className="text-red-600 font-semibold">{record.fine.amount.toLocaleString()} VND</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {record.status !== 'returned' && (
                    <button 
                      onClick={() => handleReturn(record._id)}
                      className="flex items-center gap-1 text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg ml-auto"
                    >
                      <RotateCcw size={14} />
                      Return
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {loading && (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {records.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">No borrowing records found.</div>
        )}
      </div>
    </div>
  );
};

export default BorrowsPage;
