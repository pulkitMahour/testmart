import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'testmart_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, qty = 1) => {
    const id = product._id;
    setItems((prev) => {
      const existing = prev.find((i) => i.product === id);
      if (existing) {
        return prev.map((i) => (i.product === id ? { ...i, qty: i.qty + qty } : i));
      }
      return [
        ...prev,
        {
          product: id,
          name: product.name,
          price: product.price,
          image: product.image,
          countInStock: product.countInStock,
          qty,
        },
      ];
    });
  };

  const removeFromCart = (id) => setItems((prev) => prev.filter((i) => i.product !== id));

  const updateQty = (id, qty) =>
    setItems((prev) => prev.map((i) => (i.product === id ? { ...i, qty: Math.max(1, qty) } : i)));

  const clearCart = () => setItems([]);

  const itemCount = items.reduce((sum, i) => sum + i.qty, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const value = { items, addToCart, removeFromCart, updateQty, clearCart, itemCount, subtotal };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
