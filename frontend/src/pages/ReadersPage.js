import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, UserPlus, Mail, Phone, BookOpen, Trash2, Edit } from 'lucide-react';

const ReadersPage = () => {
  const [readers, setReaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchReaders();
  }, []);

  const fetchReaders = async () => {
    try {
      setLoading(true);
      const res = await api.readers.getAll();
      setReaders(res.data.data);
    } catch (err) {
      console.error('Failed to fetch readers', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReaders = readers.filter(r => 
    r.fullName.toLowerCase().includes(search.toLowerCase()) || 
    r.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-800">Readers Management</h2>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
          <UserPlus size={18} />
          <span>Add Reader</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or username..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReaders.map((reader) => (
          <div key={reader._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className={`absolute top-0 right-0 h-1 w-full ${reader.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {reader.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{reader.fullName}</h3>
                  <p className="text-sm text-gray-500">@{reader.username}</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50">
                  <Edit size={16} />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span>{reader.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span>{reader.phoneNumber || 'No phone'}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center text-sm">
              <div className="flex items-center gap-2 text-indigo-600 font-medium cursor-pointer hover:underline">
                <BookOpen size={16} />
                <span>View Borrow History</span>
              </div>
              <span className="text-gray-400">ID: {reader._id.slice(-6)}</span>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {filteredReaders.length === 0 && !loading && (
        <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500">No readers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default ReadersPage;
