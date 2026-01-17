import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from './AuthContext';
import readerService from '../services/readerService';

const BasketContext = createContext();

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (!context) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};

export const BasketProvider = ({ children }) => {
    const { isAuthenticated, isReader } = useAuth();
    const [basket, setBasket] = useState([]);
    const [isBasketOpen, setIsBasketOpen] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initial fetch from backend when user logs in
    useEffect(() => {
        const fetchBasket = async () => {
            if (isAuthenticated && isReader) {
                try {
                    const res = await readerService.getBasket();
                    setBasket(res.success && Array.isArray(res.data) ? res.data : []);
                } catch (error) {
                    console.error("Failed to fetch basket", error);
                } finally {
                    setIsInitialized(true);
                }
            } else {
                setBasket([]);
                setIsInitialized(false);
            }
        };
        fetchBasket();
    }, [isAuthenticated, isReader]);

    // Sync to backend on basket update
    useEffect(() => {
        const syncBasket = async () => {
            if (isAuthenticated && isReader && isInitialized) {
                try {
                    const basketToSync = basket.map(item => ({
                        book: item.book._id || item.book,
                        quantity: item.quantity,
                        selected: item.selected
                    }));
                    await readerService.updateBasket(basketToSync);
                } catch (error) {
                    console.error("Failed to sync basket", error);
                }
            }
        };

        // Debounce sync to avoid too many requests
        const timeoutId = setTimeout(syncBasket, 1000);
        return () => clearTimeout(timeoutId);
    }, [basket, isAuthenticated, isReader, isInitialized]);

    const addToBasket = (book, quantity = 1) => {
        if (!isAuthenticated || !isReader) {
            toast.error("Vui lòng đăng nhập với tài khoản độc giả để sử dụng tủ sách");
            return false;
        }

        if (quantity > book.available) {
            toast.error(`Chỉ còn ${book.available} cuốn có sẵn`);
            return false;
        }

        const existingIndex = basket.findIndex(item => (item.book._id || item.book) === book._id);
        if (existingIndex > -1) {
            const newBasket = [...basket];
            newBasket[existingIndex].quantity += quantity;
            setBasket(newBasket);
        } else {
            setBasket([...basket, { book, quantity, selected: true }]);
        }
        
        toast.success(
            (t) => (
                <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">Đã thêm vào tủ sách!</span>
                    <button 
                        onClick={() => {
                            toast.dismiss(t.id);
                            window.location.href = '/reader/basket';
                        }}
                        className="bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-colors"
                    >
                        Xem tủ sách
                    </button>
                </div>
            ),
            { duration: 4000 }
        );
        return true;
    };

    const removeFromBasket = (bookId) => {
        setBasket(basket.filter(item => (item.book._id || item.book) !== bookId));
    };

    const clearBasket = () => {
        setBasket([]);
    };

    const updateQuantity = (bookId, delta) => {
        setBasket(basket.map(item => {
            const currentBookId = item.book._id || item.book;
            if (currentBookId === bookId) {
                const newQty = Math.max(0, item.quantity + delta);
                // Check availability if book is populated
                if (item.book.available !== undefined && newQty > item.book.available) {
                    toast.error("Vượt quá số lượng sẵn có");
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const toggleSelection = (bookId) => {
        setBasket(basket.map(item => {
            const currentBookId = item.book._id || item.book;
            return currentBookId === bookId ? { ...item, selected: !item.selected } : item;
        }));
    };

    return (
        <BasketContext.Provider value={{
            basket,
            setBasket,
            isBasketOpen,
            setIsBasketOpen,
            addToBasket,
            removeFromBasket,
            clearBasket,
            updateQuantity,
            toggleSelection
        }}>
            {children}
        </BasketContext.Provider>
    );
};
