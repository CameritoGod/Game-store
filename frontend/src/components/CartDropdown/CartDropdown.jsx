import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import CheckoutModal from "../checkoutModal/CheckoutModal.jsx";
import "./CartDropdown.css";

export default function CartDropdown({ onClose }) {
  const { cartItems, removeFromCart, subtotal, totalDiscount, totalPrice } = useCart();
  const [openCheckout, setOpenCheckout] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef();

  // Escuchar clics fuera del dropdown para cerrarlo suavemente (respetando el modal de checkout)
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignorar si el modal de checkout está abierto o si el clic se realiza dentro del modal
      if (openCheckout || event.target.closest('.checkout-overlay') || event.target.closest('.checkout-modal-container')) {
        return;
      }
      // Ignorar si se hace clic en el botón activador del carrito en el navbar
      if (event.target.closest('.cart-btn')) return;
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        if (onClose) onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, openCheckout]);

  // Navega al catálogo completo y cierra el dropdown del carrito
  const handleExplore = () => {
    if (onClose) onClose();
    navigate("/AllGame");
  };

  return (
    <>
      <div className="cart-dropdown-container" ref={dropdownRef}>
        
        {/* Encabezado del Carrito */}
        <div className="cart-dropdown-header">
          <div className="cart-header-title">
            <i className="bi bi-bag-check-fill cart-header-icon me-2"></i>
            <div>
              <h6 className="m-0 text-white fw-bold">Tu Carrito</h6>
              <small className="cart-item-count">
                {cartItems.length} {cartItems.length === 1 ? "juego seleccionado" : "juegos seleccionados"}
              </small>
            </div>
          </div>
          {onClose && (
            <button className="cart-close-btn" onClick={onClose} title="Cerrar carrito">
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* CONTENIDO DEL CARRITO */}
        {cartItems.length === 0 ? (
          /* ESTADO VACÍO ELEGANTE */
          <div className="cart-empty-state">
            <div className="empty-icon-wrapper">
              <i className="bi bi-cart-x"></i>
            </div>
            <h6 className="text-white fw-bold mt-3 mb-1">Tu carrito está vacío</h6>
            <p className="empty-desc">
              Aún no has agregado juegos a tu pedido. Explora nuestro catálogo y añade los títulos que más te gusten.
            </p>
            <button className="cart-btn-explore mt-2" onClick={handleExplore}>
              <i className="bi bi-compass me-2"></i> Explorar Catálogo
            </button>
          </div>
        ) : (
          /* LISTA DE JUEGOS Y RESUMEN */
          <>
            {/* Lista de Juegos */}
            <div className="cart-items-list">
              {cartItems.map((item) => {
                const imgSrc = item.image || item.cover || item.imagen_url || "/nulls/placeholder-game.svg";
                const isDiscounted = item.hasDiscount || (item.originalPrice && item.originalPrice > item.price);

                return (
                  <div key={item.id} className="cart-item-card">
                    <img
                      src={imgSrc}
                      alt={item.title}
                      className="cart-item-img"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/nulls/placeholder-game.svg";
                      }}
                    />
                    <div className="cart-item-details">
                      <span className="cart-item-title text-truncate" title={item.title}>
                        {item.title}
                      </span>
                      <div className="cart-item-meta">
                        <span className="badge-key">Clave Digital</span>
                        {isDiscounted ? (
                          <div className="d-flex align-items-center gap-1">
                            <span className="text-muted text-decoration-line-through small" style={{ fontSize: '0.78rem' }}>
                              ${Number(item.originalPrice).toFixed(2)}
                            </span>
                            <span className="cart-item-price text-success fw-bold">
                              ${Number(item.price).toFixed(2)}
                            </span>
                          </div>
                        ) : (
                          <span className="cart-item-price">${Number(item.price).toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      className="cart-item-delete-btn"
                      title="Eliminar del carrito"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <i className="bi bi-trash3"></i>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Banner de Aviso de Entorno de Pruebas */}
            <div className="cart-demo-notice">
              <i className="bi bi-shield-exclamation notice-icon"></i>
              <div className="notice-text">
                <strong>Simulación de compra</strong>
                <span>Entorno de demostración. No ingreses datos bancarios reales.</span>
              </div>
            </div>

            {/* Resumen Fijo Inferior */}
            <div className="cart-summary-footer">
              <div className="cart-summary-row">
                <span className="text-muted small">Subtotal</span>
                <span className="text-white small fw-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row">
                <span className="text-muted small">Descuentos</span>
                <span className="text-success-neon small fw-bold">-${totalDiscount.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row total-row">
                <span className="total-label">Total a Pagar</span>
                <span className="total-amount">${totalPrice.toFixed(2)}</span>
              </div>

              {/* Botón Principal de Acción */}
              <button
                className="cart-checkout-btn w-100"
                onClick={() => setOpenCheckout(true)}
              >
                <i className="bi bi-credit-card-2-front-fill me-2"></i> Proceder al Pago
              </button>
            </div>
          </>
        )}

      </div>

      {/* Modal de Checkout */}
      <CheckoutModal
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        total={totalPrice}
      />
    </>
  );
}
