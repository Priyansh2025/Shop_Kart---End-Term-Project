import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/cart");
      setCartItems(response.data.cart || []);
    } catch (requestError) {
      // A logged-out visitor should simply start with an empty local cart view.
      if (requestError.response?.status === 401) {
        setCartItems([]);
        setError("Please log in to view your cart.");
      } else {
        setError(requestError.response?.data?.message || "Unable to load your cart.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshCart(); }, [refreshCart]);

  const addToCart = useCallback(async (productId) => {
    const response = await api.post(`/cart/${productId}`);
    setCartItems(response.data.cart || []);
    return response.data;
  }, []);

  const updateQuantity = useCallback(async (productId, quantity) => {
    const response = await api.patch(`/cart/${productId}`, { quantity });
    setCartItems(response.data.cart || []);
    return response.data;
  }, []);

  const removeFromCart = useCallback(async (productId) => {
    const response = await api.delete(`/cart/${productId}`);
    setCartItems(response.data.cart || []);
    return response.data;
  }, []);

  const clearCartView = useCallback(() => { setCartItems([]); setError(""); }, []);

  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((sum, item) => sum + (Number(item.product?.price) || 0) * item.quantity, 0), [cartItems]);

  const value = useMemo(() => ({
    cartItems, loading, error, totalItems, subtotal,
    refreshCart, addToCart, updateQuantity, removeFromCart, clearCartView,
  }), [cartItems, loading, error, totalItems, subtotal, refreshCart, addToCart, updateQuantity, removeFromCart, clearCartView]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
