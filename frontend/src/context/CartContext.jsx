/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { checkoutCart } from "../api/userApi";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const audioRef = useRef(null);
  const count = cartItems.length;

  useEffect(() => {
    audioRef.current = new Audio("/sounds/compra.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const isInCart = (id) =>
    cartItems.some(item => Number(item.id || item.id_juego) === Number(id));

  const addToCart = (game) => {
    if (!user) {
      setToast("Debes iniciar sesión para añadir al carrito");
      setTimeout(() => setToast(null), 2500);
      return;
    }

    const gameId = game.id || game.id_juego;
    if (isInCart(gameId)) {
      setToast("Este juego ya está en el carrito 🎮");
      setTimeout(() => setToast(null), 2000);
      return;
    }

    const formattedGame = {
      id: gameId,
      id_juego: gameId,
      title: game.name || game.nombre || game.title,
      nombre: game.name || game.nombre || game.title,
      cover: game.cover || game.imagen_url || game.coverUrl,
      imagen_url: game.cover || game.imagen_url || game.coverUrl,
      price: game.precio_actual || game.price || 19.99
    };

    setCartItems(prev => [...prev, formattedGame]);
    audioRef.current?.play().catch(() => {});

    setToast(`${formattedGame.title} añadido al carrito 🛒`);
    setTimeout(() => setToast(null), 2500);
  };

  const removeFromCart = (id) => {
    setCartItems(prev => prev.filter(item => Number(item.id || item.id_juego) !== Number(id)));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem("cart");
  };

  const processCheckout = async () => {
    if (cartItems.length === 0) return;
    setPurchasing(true);
    try {
      const response = await checkoutCart(cartItems);
      clearCart();
      setToast("¡Compra realizada con éxito! 🎮 Juegos añadidos a tu biblioteca.");
      setTimeout(() => setToast(null), 3000);
      setPurchasing(false);
      return response;
    } catch (error) {
      setPurchasing(false);
      const msg = error.response?.data?.message || error.message || "Error al procesar la compra";
      setToast(`❌ ${msg}`);
      setTimeout(() => setToast(null), 3500);
      throw error;
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price || item.precio || 0),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        processCheckout,
        totalPrice,
        isInCart,
        purchasing,
        count
      }}
    >
      {children}
      {toast && <div className="cart-toast">{toast}</div>}
    </CartContext.Provider>
  );
}
