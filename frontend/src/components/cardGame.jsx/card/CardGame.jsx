/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useCart } from "../../../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import "./cardGame.css";

export default function CardGame({
  id,
  title,
  year,
  genre,
  rating,
  price,
  image,
  isOwned,
  inLibrary
}) {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const isPurchased = Boolean(isOwned || inLibrary);

  // Formatear precio numérico o string
  const displayPrice =
    typeof price === "number"
      ? `$${price.toFixed(2)}`
      : String(price).startsWith("$")
      ? price
      : `$${Number(price || 0).toFixed(2)}`;

  return (
    <motion.div className="card-game-wrapper">
      <div className="card game-card bg-dark text-white">
        <div className="game-image-wrapper">
          <img
            src={image || "/nulls/placeholder-game.svg"}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/nulls/placeholder-game.svg";
            }}
          />
          {isPurchased && (
            <span className="badge bg-success position-absolute top-0 start-0 m-2 px-2 py-1 shadow-sm">
              <i className="bi bi-check-circle-fill me-1"></i> Comprado
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="text-truncate" title={title}>{title}</h5>
          <small className="text-secondary">{genre} • {year}</small>

          <div className="mt-auto pt-2">
            <p className="price m-0 mb-2">{displayPrice}</p>

            <div className="d-flex gap-2 card-buttons">
              {isPurchased ? (
                <button className="btn btn-secondary w-100 disabled" disabled style={{ opacity: 0.85 }}>
                  <i className="bi bi-check-circle-fill text-success me-1"></i> En biblioteca
                </button>
              ) : (
                <button
                  className="btn btn-primary w-100"
                  disabled={isInCart(id)}
                  onClick={() => addToCart({ id, title, price: displayPrice.replace("$", ""), image })}
                >
                  <i className="bi bi-cart-plus me-1"></i> {isInCart(id) ? "En carrito" : "Añadir"}
                </button>
              )}
              <button
                className="btn btn-outline-light w-100 add-cart-btn"
                onClick={() => navigate(`/game/${id}`)}
              >
                Detalles
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
