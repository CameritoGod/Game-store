import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { addPurchases } from "../../api/userApi";
import "./CheckoutModal.css";

export default function CheckoutModal({ open, onClose, total }) {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  // Estados de datos de la tarjeta simulada
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  // Estados de flujo de pago
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [txnId, setTxnId] = useState(null);

  if (!open) return null;

  // Formateador dinámico para el número de tarjeta (4 bloques de 4 dígitos)
  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  // Formateador para fecha de expiración MM/AA
  const handleExpiryChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    let formatted = raw;
    if (raw.length >= 3) {
      formatted = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiry(formatted);
  };

  // Formateador para CVV (3 o 4 dígitos)
  const handleCvvChange = (e) => {
    const raw = e.target.value.replace(/\D/g, "").slice(0, 4);
    setCvv(raw);
  };

  // Rellena automáticamente los campos con datos ficticios seguros para pruebas
  const fillDemoData = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setCardNumber("4532 8912 3456 7890");
    setCardHolder("JUGADOR DEMO");
    setExpiry("12/28");
    setCvv("777");
    setError(null);
  };

  // Cierra y resetea el modal de pago de forma segura
  const handleClose = (e) => {
    if (e) {
      e.stopPropagation();
    }
    if (loading) return;
    setSuccess(false);
    setError(null);
    setCardNumber("");
    setCardHolder("");
    setExpiry("");
    setCvv("");
    onClose();
  };

  // Maneja el clic en la capa oscura exterior asegurando que solo cierre si es target directo
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };

  // Procesa la compra simulada con retrasos de carga e interacción con el backend
  const handlePayment = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!cardNumber || !cardHolder || !expiry || !cvv) {
      setError("Por favor completa los datos de la tarjeta de prueba antes de continuar.");
      return;
    }

    if (cardNumber.replace(/\s/g, "").length < 16) {
      setError("El número de tarjeta simulada debe tener 16 dígitos.");
      return;
    }

    setLoading(true);
    setError(null);
    setLoadingStep("Verificando datos de tarjeta simulada...");

    try {
      // Simulación visual de procesamiento por pasos
      await new Promise((resolve) => setTimeout(resolve, 900));
      setLoadingStep("Procesando pago seguro...");
      await new Promise((resolve) => setTimeout(resolve, 900));
      setLoadingStep("Asignando licencias a tu biblioteca...");
      await new Promise((resolve) => setTimeout(resolve, 700));

      // Preparar estructura de datos para el backend
      const purchaseData = {
        items: cartItems.map((item) => ({
          id_juego: item.id,
          nombre: item.title,
          imagen_url: item.image || item.cover || item.imagen_url || "/nulls/placeholder-game.svg",
          precio: item.price
        })),
        total
      };

      // Registrar la compra en la base de datos
      await addPurchases(purchaseData);

      const generatedTxn = `GS-${Math.floor(100000 + Math.random() * 900000)}`;
      setTxnId(generatedTxn);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error("Error procesando compra:", err);
      setError("Ocurrió un error al registrar la compra. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setLoadingStep("");
    }
  };

  return (
    <div className="checkout-overlay" onClick={handleOverlayClick} onMouseDown={handleOverlayClick}>
      <div className="checkout-modal-container" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        
        {/* Encabezado del Modal */}
        <div className="checkout-header">
          <div className="checkout-header-title">
            <i className="bi bi-shield-check text-purple me-2 fs-4"></i>
            <div>
              <h5 className="m-0 text-white fw-bold">Pasarela de Pago</h5>
              <small className="text-white">Finalización segura de compra</small>
            </div>
          </div>
          <button type="button" className="checkout-close-btn" onClick={handleClose} disabled={loading}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Banner de Advertencia Entorno de Pruebas */}
        <div className="demo-warning-banner">
          <div className="demo-warning-icon">
            <i className="bi bi-exclamation-triangle-fill"></i>
          </div>
          <div className="demo-warning-content">
            <strong>Entorno de Pruebas y Demostración</strong>
            <p className="m-0">
              Esta pasarela es 100% simulada. <span>NO ingreses información bancaria o sensible real.</span>
            </p>
          </div>
          {!success && !loading && (
            <button type="button" className="btn-demo-autofill" onClick={fillDemoData}>
              <i className="bi bi-magic me-1"></i> Datos de prueba
            </button>
          )}
        </div>

        {/* VISTA DE ÉXITO */}
        {success ? (
          <div className="checkout-success-view">
            <div className="success-icon-badge">
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <h3 className="text-white fw-bold mt-3 mb-1">¡Pago Realizado con Éxito!</h3>
            <p className="text-muted mb-4">Los juegos han sido agregados a tu biblioteca personal.</p>

            <div className="success-receipt-card">
              <div className="receipt-row">
                <span className="text-muted">N° Transacción:</span>
                <span className="text-purple fw-mono">{txnId}</span>
              </div>
              <div className="receipt-row">
                <span className="text-muted">Juegos adquiridos:</span>
                <span className="text-white">{cartItems.length || "Licencias de catálogo"}</span>
              </div>
              <div className="receipt-row total-row">
                <span className="text-white fw-bold">Total Abonado:</span>
                <span className="text-success-neon fw-bold fs-5">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="checkout-success-actions mt-4">
              <button
                type="button"
                className="checkout-btn-primary w-100 mb-2 py-2 fs-6"
                onClick={(e) => {
                  handleClose(e);
                  navigate("/user");
                }}
              >
                <i className="bi bi-controller me-2"></i> Ir a mi Biblioteca
              </button>
              <button type="button" className="checkout-btn-secondary w-100 py-2 fs-6" onClick={handleClose}>
                Seguir Explorando
              </button>
            </div>
          </div>
        ) : loading ? (
          /* VISTA DE CARGA / PROCESAMIENTO */
          <div className="checkout-loading-view">
            <div className="spinner-glow">
              <div className="spinner-border text-purple" role="status" style={{ width: "3.5rem", height: "3.5rem" }}>
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
            <h5 className="text-white fw-bold mt-4">{loadingStep}</h5>
            <p className="text-muted small">Por favor no cierres esta ventana mientras procesamos la transacción.</p>
          </div>
        ) : (
          /* VISTA PRINCIPAL (FORMULARIO Y RESUMEN) */
          <div className="checkout-grid">
            
            {/* Columna Izquierda: Resumen de la Orden */}
            <div className="checkout-summary-section">
              <h6 className="section-subtitle">
                <i className="bi bi-cart-check me-2"></i> Resumen del Pedido ({cartItems.length})
              </h6>

              <div className="summary-items-scroll">
                {cartItems.map((item) => (
                  <div key={item.id} className="summary-item-card">
                    <img
                      src={item.image || item.cover || item.imagen_url || "/nulls/placeholder-game.svg"}
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/nulls/placeholder-game.svg";
                      }}
                    />
                    <div className="summary-item-info">
                      <span className="item-title text-truncate">{item.title}</span>
                      <span className="item-badge">Digital Key</span>
                    </div>
                    <span className="item-price">${Number(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-financials">
                <div className="financial-row">
                  <span>Subtotal</span>
                  <span>${total.toFixed(2)}</span>
                </div>
                <div className="financial-row">
                  <span>Descuentos / Promos</span>
                  <span className="text-success-neon">-$0.00</span>
                </div>
                <div className="financial-row">
                  <span>Tarifa de procesamiento</span>
                  <span>$0.00 (Gratis)</span>
                </div>
                <hr className="divider" />
                <div className="financial-row total-highlight">
                  <span>Total a Pagar:</span>
                  <span className="total-price">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Tarjeta Simulada y Formulario */}
            <div className="checkout-form-section">
              <h6 className="section-subtitle">
                <i className="bi bi-credit-card me-2"></i> Tarjeta de Prueba
              </h6>

              {/* Previsualización 3D de Tarjeta Simulada (Conservada visible en todos los tamaños) */}
              <div className="simulated-card-preview">
                <div className="card-preview-top">
                  <i className="bi bi-cpu-fill chip-icon"></i>
                  <span className="card-type-logo">VISA</span>
                </div>
                <div className="card-preview-number">
                  {cardNumber || "•••• •••• •••• ••••"}
                </div>
                <div className="card-preview-bottom">
                  <div>
                    <small className="d-block card-label">TITULAR</small>
                    <span className="card-val text-truncate d-inline-block" style={{ maxWidth: "160px" }}>
                      {cardHolder.toUpperCase() || "JUGADOR DEMO"}
                    </span>
                  </div>
                  <div>
                    <small className="d-block card-label">EXPIRACIÓN</small>
                    <span className="card-val">{expiry || "MM/AA"}</span>
                  </div>
                </div>
              </div>

              {/* Campos del Formulario */}
              <div className="checkout-form-inputs mt-3">
                <div className="input-group-custom mb-2">
                  <label>Número de Tarjeta</label>
                  <div className="input-wrapper">
                    <i className="bi bi-credit-card-2-front input-icon"></i>
                    <input
                      type="text"
                      placeholder="4532 0000 0000 0000"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      maxLength={19}
                    />
                  </div>
                </div>

                <div className="input-group-custom mb-2">
                  <label>Nombre en la Tarjeta</label>
                  <div className="input-wrapper">
                    <i className="bi bi-person input-icon"></i>
                    <input
                      type="text"
                      placeholder="Nombre del Titular"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                    />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-6">
                    <div className="input-group-custom">
                      <label>Expiración</label>
                      <div className="input-wrapper">
                        <i className="bi bi-calendar-event input-icon"></i>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={expiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="input-group-custom">
                      <label>CVV</label>
                      <div className="input-wrapper">
                        <i className="bi bi-lock input-icon"></i>
                        <input
                          type="password"
                          placeholder="123"
                          value={cvv}
                          onChange={handleCvvChange}
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="checkout-error-alert mt-3">
                    <i className="bi bi-exclamation-circle-fill me-2"></i>
                    {error}
                  </div>
                )}

                {/* Acciones de Pago */}
                <div className="checkout-actions-row mt-3">
                  <button type="button" className="checkout-btn-secondary" onClick={handleClose}>
                    Cancelar
                  </button>
                  <button type="button" className="checkout-btn-primary" onClick={handlePayment}>
                    <i className="bi bi-lock-fill me-1"></i> Pagar ${total.toFixed(2)}
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
