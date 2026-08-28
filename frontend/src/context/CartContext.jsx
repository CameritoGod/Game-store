/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/useAuth";
import { checkoutCart } from "../api/userApi";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

/**
 * Proveedor global de estado para el carrito de compras con persistencia local y cálculo de descuentos.
 */
export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [purchasing, setPurchasing] = useState(false);

  const audioRef = useRef(null);
  const count = cartItems.length;

  // Precarga de audio para feedback sonoro al agregar artículos
  useEffect(() => {
    audioRef.current = new Audio("/sounds/compra.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  // Cargar estado inicial del carrito desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCartItems(JSON.parse(stored));
      } catch {
        // Ignorar datos corruptos en storage
      }
    }
  }, []);

  // Sincronizar cambios del carrito con localStorage
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

    const rawImage = game.image || game.cover || game.imagen_url || game.coverUrl || game.image_url;
    const imageUrl = (rawImage && typeof rawImage === 'string' && rawImage.trim() !== '') 
      ? rawImage 
      : '/nulls/placeholder-game.svg';

    const finalPrice = Number(game.price !== undefined ? game.price : (game.precio !== undefined ? game.precio : 19.99));
    
    // Extraer precio original numérico
    const rawOldPrice = game.precio_original !== undefined ? game.precio_original : game.oldPrice;
    const originalPrice = rawOldPrice
      ? Number(String(rawOldPrice).replace(/[^0-9.]/g, ''))
      : finalPrice;

    const discountPct = game.porcentaje_descuento || (game.discount ? Number(String(game.discount).replace(/[^0-9]/g, '')) : 0);
    const hasDiscount = Boolean(game.hasDiscount || (originalPrice > finalPrice) || (discountPct > 0));

    const formattedGame = {
      id: gameId,
      id_juego: gameId,
      title: game.name || game.nombre || game.title || `Juego #${gameId}`,
      nombre: game.name || game.nombre || game.title || `Juego #${gameId}`,
      image: imageUrl,
      cover: imageUrl,
      imagen_url: imageUrl,
      price: finalPrice,
      originalPrice: hasDiscount ? Math.max(originalPrice, finalPrice) : finalPrice,
      hasDiscount: hasDiscount,
      discount: game.discount || (discountPct > 0 ? `-${discountPct}%` : null),
      porcentaje_descuento: discountPct
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

  // Cálculo financiero exacto del carrito
  const subtotal = cartItems.reduce(
    (total, item) => total + Number(item.originalPrice || item.price || 0),
    0
  );

  const totalDiscount = cartItems.reduce(
    (total, item) => total + Math.max(0, Number(item.originalPrice || item.price || 0) - Number(item.price || 0)),
    0
  );

  const totalPrice = cartItems.reduce(
    (total, item) => total + Number(item.price || 0),
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
        subtotal,
        totalDiscount,
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
