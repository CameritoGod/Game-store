/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth"; // 👈 contexto de auth

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useAuth(); // 👈 usuario real
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);

  const audioRef = useRef(null);

  const count = cartItems.length;

  // Sonido (una sola vez)
  useEffect(() => {
    audioRef.current = new Audio("/sounds/compra.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  // LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) setCartItems(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const isInCart = (id) =>
    cartItems.some(item => item.id === id);

  const addToCart = (game) => {
    if (!user) {
      setToast("Debes iniciar sesión para añadir al carrito");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    if (isInCart(game.id)) {
      setToast("Este juego ya está en el carrito 🎮");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    setCartItems(prev => [...prev, game]);

    audioRef.current?.play();

    setToast(`${game.title} añadido al carrito 🛒`);
    setTimeout(() => setToast(null), 2500);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        totalPrice,
        isInCart,
        count
      }}
    >
      {children}

      {toast && <div className="cart-toast">{toast}</div>}
    </CartContext.Provider>
  );
}
