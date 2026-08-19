import { useState } from "react";
import { useCart } from "../../context/CartContext";
import CheckoutModal from "../checkoutModal/CheckoutModal.jsx";
import "./CartDropdown.css";

export default function CartDropdown() {
  const { cartItems, removeFromCart, totalPrice } = useCart();
  const [openCheckout, setOpenCheckout] = useState(false);

  return (
    <>
      <div className="cart-dropdown">
        <h6>🛒 Carrito</h6>

        {cartItems.length === 0 ? (
          <p className="text-secondary">No hay juegos añadidos</p>
        ) : (
          <>
            <ul className="cart-list">
              {cartItems.map(item => (
                <li key={item.id} className="cart-item">
                  <img src={item.image} alt={item.title} />
                  <div>
                    <p>{item.title}</p>
                    <span>${item.price}</span>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>

            <div className="cart-total">
              <strong>Total:</strong>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <button
              className="btn btn-primary w-100 mt-2"
              onClick={() => setOpenCheckout(true)}
            >
              Ir a pagar
            </button>
          </>
        )}
      </div>

      <CheckoutModal
        open={openCheckout}
        onClose={() => setOpenCheckout(false)}
        total={totalPrice}
      />
    </>
  );
}
