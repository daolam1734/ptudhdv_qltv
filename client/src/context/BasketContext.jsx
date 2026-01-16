import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const BasketContext = createContext();

export const useBasket = () => {
    const context = useContext(BasketContext);
    if (!context) {
        throw new Error('useBasket must be used within a BasketProvider');
    }
    return context;
};

export const BasketProvider = ({ children }) => {
    const [basket, setBasket] = useState(() => {
        const savedBasket = localStorage.getItem('library_basket');
        return savedBasket ? JSON.parse(savedBasket) : [];
    });
    const [isBasketOpen, setIsBasketOpen] = useState(false);

    useEffect(() => {
        localStorage.setItem('library_basket', JSON.stringify(basket));
    }, [basket]);

    const addToBasket = (book, quantity = 1) => {
        if (quantity > book.available) {
            toast.error(`Chỉ còn ${book.available} cuốn có sẵn`);
            return false;
        }

        const existingIndex = basket.findIndex(item => item.book._id === book._id);
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
        setBasket(basket.filter(item => item.book._id !== bookId));
    };

    const clearBasket = () => {
        setBasket([]);
    };

    const updateQuantity = (bookId, delta) => {
        setBasket(basket.map(item => {
            if (item.book._id === bookId) {
                const newQty = Math.max(0, item.quantity + delta);
                if (newQty > item.book.available) {
                    toast.error("Vượt quá số lượng sẵn có");
                    return item;
                }
                return { ...item, quantity: newQty };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const toggleSelection = (bookId) => {
        setBasket(basket.map(item => 
            item.book._id === bookId ? { ...item, selected: !item.selected } : item
        ));
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
