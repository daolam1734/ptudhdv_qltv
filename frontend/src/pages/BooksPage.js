import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Edit, Trash2, Filter, Book } from 'lucide-react';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const { isStaff } = useAuth();
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [currentBook, setCurrentBook] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await api.books.getAll({ page, limit: 8, title: search });
      setBooks(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error('Failed to fetch books', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await api.books.delete(id);
        fetchBooks();
      } catch (err) {
        alert(err.message || 'Failed to delete book');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            placeholder="Search by title, author or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        {isStaff && (
          <button
            onClick={() => { setCurrentBook(null); setShowModal(true); }}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>Add New Book</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <div key={book._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="h-48 bg-gray-200 relative">
                  {book.coverImage ? (
                    <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <Book size={48} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      book.available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {book.available > 0 ? 'Available' : 'Out of Stock'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2">{book.author}</p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>ISBN: {book.isbn}</span>
                    <span className="font-medium text-gray-600">{book.available}/{book.quantity} copies</span>
                  </div>
                  
                  {isStaff && (
                    <div className="mt-4 flex gap-2 border-t pt-4">
                      <button 
                        onClick={() => { setCurrentBook(book); setShowModal(true); }}
                        className="flex-1 flex items-center justify-center gap-1 text-indigo-600 hover:bg-indigo-50 py-1.5 rounded transition-colors"
                      >
                        <Edit size={16} />
                        <span className="text-xs">Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(book._id)}
                        className="flex-1 flex items-center justify-center gap-1 text-red-600 hover:bg-red-50 py-1.5 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                        <span className="text-xs">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {books.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500">No books found matching your search.</p>
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex justify-center mt-8 gap-2">
              {[...Array(pagination.pages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                    page === i + 1 ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-indigo-50 shadow-sm border border-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BooksPage;
