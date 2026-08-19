import { useState } from "react";
import { useCart } from "../../context/CartContext";
import { addPurchases } from "../../api/userApi";
import "./CheckoutModal.css";

export default function CheckoutModal({ open, onClose, total }) {
  const { cartItems, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    // Simulación de pasarela
    setTimeout(async () => {
      const paymentSuccess = Math.random() > 0.2; // 80% éxito

      if (!paymentSuccess) {
        setLoading(false);
        setError(" Pago rechazado. Intenta nuevamente.");
        return;
      }

      try {
        // Armar compra desde el carrito
        const purchaseData = {
          items: cartItems.map(item => ({
            id_juego: item.id,
            nombre: item.title,
            imagen_url: item.image,
            precio: item.price
          })),
          total
        };

        // Guardar compra en backend
        await addPurchases(purchaseData);

        setSuccess(true);
        clearCart();

        setTimeout(() => {
          setSuccess(false);
          onClose();
        }, 2500);

      } catch (err) {
        console.error(err);
        setError("❌ Error al registrar la compra");
        console.log(cartItems.id)
      } finally {
        setLoading(false);
      }
    }, 2500);
  };


  return (
    <div className="checkout-overlay">
      <div className="checkout-modal">
        {success ? (
          <>
            <h3 className="success-text">✅ Pago realizado</h3>
            <p>Gracias por tu compra</p>
          </>
        ) : (
          <>
            <h4>💳 Finalizar compra</h4>

            <p>Total a pagar:</p>
            <h2>${total.toFixed(2)}</h2>

            <input type="text" placeholder="Número de tarjeta" />
            <input type="text" placeholder="Nombre del titular" />

            <div className="checkout-row">
              <input type="text" placeholder="MM/AA" />
              <input type="text" placeholder="CVV" />
            </div>

            {error && <p className="checkout-error">{error}</p>}

            <div className="checkout-actions">
              <button
                className="btn btn-outline-light"
                onClick={onClose}
                disabled={loading}
              >
                Cancelar
              </button>

              <button
                className="btn btn-primary"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Procesando..." : "Pagar ahora"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
