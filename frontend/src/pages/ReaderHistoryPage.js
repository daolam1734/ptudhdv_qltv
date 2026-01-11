import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Calendar, Book, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const ReaderHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.readers.getHistory(user._id);
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch history', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'borrowed': return <Clock size={18} className="text-blue-500" />;
      case 'overdue': return <AlertTriangle size={18} className="text-red-500" />;
      case 'returned': return <CheckCircle size={18} className="text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 mt-10">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-black text-gray-800">My Reading Journey</h2>
        <p className="text-gray-500 font-medium">Tracking your borrowed books and history.</p>
      </div>

      <div className="space-y-4">
        {history.map((record) => (
          <div key={record._id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-indigo-200 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-20 bg-gray-50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-200 text-gray-400 group-hover:border-indigo-100 group-hover:bg-indigo-50/30 transition-all">
                <Book size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-gray-900 text-lg">{record.bookId?.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5"><Calendar size={14}/> {new Date(record.borrowDate).toLocaleDateString()}</span>
                  <span className={`flex items-center gap-1.5 ${record.status === 'overdue' ? 'text-red-600 font-bold' : ''}`}>
                    <Clock size={14}/> Due: {new Date(record.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 font-bold capitalize">
                {getStatusIcon(record.status)}
                <span className={
                  record.status === 'returned' ? 'text-green-600' : 
                  record.status === 'overdue' ? 'text-red-600' : 'text-blue-600'
                }>
                  {record.status}
                </span>
              </div>
              {record.fine?.amount > 0 && (
                <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-full font-bold">
                  Fine: {record.fine.amount.toLocaleString()} VND
                </span>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {history.length === 0 && !loading && (
          <div className="bg-white p-20 rounded-3xl border-2 border-dashed border-gray-100 text-center space-y-4">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto">
              <Book size={40} className="text-indigo-200" />
            </div>
            <p className="text-gray-400 font-medium">You haven't borrowed any books yet.</p>
            <button className="text-indigo-600 font-black hover:underline px-4 py-2">Explore Library</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderHistoryPage;
