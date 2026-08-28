/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useCart } from "../../../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";
import "./cardGame.css";

export default function CardGame({
  id,
  id_juego,
  title,
  name,
  year,
  genre,
  rating,
  price,
  oldPrice,
  precio_original,
  discount,
  porcentaje_descuento,
  hasDiscount,
  image,
  cover,
  isOwned,
  inLibrary
}) {
  const { addToCart, isInCart } = useCart();
  const navigate = useNavigate();

  const gameId = id || id_juego;
  const gameTitle = title || name || `Juego #${gameId}`;
  const gameImage = image || cover || "/nulls/placeholder-game.svg";
  const isPurchased = Boolean(isOwned || inLibrary);

  // Formatear precio numérico y precio base
  const numericPrice = typeof price === "number" ? price : parseFloat(String(price || 0).replace("$", "")) || 29.99;
  const displayPrice = `$${numericPrice.toFixed(2)}`;

  const isDiscountActive = Boolean(hasDiscount || (discount && discount !== "0%") || (porcentaje_descuento && porcentaje_descuento > 0));
  const discountLabel = discount || (porcentaje_descuento ? `-${porcentaje_descuento}%` : null);

  const displayOldPrice = oldPrice || (precio_original ? `$${Number(precio_original).toFixed(2)}` : null);

  const handleAddToCart = () => {
    addToCart({
      id: gameId,
      id_juego: gameId,
      title: gameTitle,
      name: gameTitle,
      price: numericPrice,
      oldPrice: displayOldPrice,
      precio_original: precio_original || (displayOldPrice ? Number(String(displayOldPrice).replace(/[^0-9.]/g, '')) : null),
      discount: discountLabel,
      porcentaje_descuento,
      hasDiscount: isDiscountActive,
      image: gameImage
    });
  };

  return (
    <motion.div className="card-game-wrapper">
      <div className="card game-card bg-dark text-white">
        <div className="game-image-wrapper position-relative">
          <img
            src={gameImage}
            alt={gameTitle}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/nulls/placeholder-game.svg";
            }}
          />

          {/* Insignia de Comprado */}
          {isPurchased && (
            <span className="badge bg-success position-absolute top-0 start-0 m-2 px-2 py-1 shadow-sm">
              <i className="bi bi-check-circle-fill me-1"></i> Comprado
            </span>
          )}

          {/* Insignia de Oferta/Descuento */}
          {isDiscountActive && discountLabel && (
            <span className="badge bg-danger position-absolute top-0 end-0 m-2 px-2 py-1 shadow-sm fw-bold">
              {discountLabel}
            </span>
          )}
        </div>

        <div className="card-body d-flex flex-column">
          <h5 className="text-truncate" title={gameTitle}>{gameTitle}</h5>
          <small className="text-secondary">{genre} • {year}</small>

          <div className="mt-auto pt-2">
            {/* Despliegue de Precios con Descuento si Aplica */}
            {isDiscountActive && displayOldPrice ? (
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="text-muted text-decoration-line-through small">{displayOldPrice}</span>
                <span className="price m-0 text-success fw-bold">{displayPrice}</span>
              </div>
            ) : (
              <p className="price m-0 mb-2">{displayPrice}</p>
            )}

            <div className="d-flex gap-2 card-buttons">
              {isPurchased ? (
                <button className="btn btn-secondary w-100 disabled" disabled style={{ opacity: 0.85 }}>
                  <i className="bi bi-check-circle-fill text-success me-1"></i> En biblioteca
                </button>
              ) : (
                <button
                  className="btn btn-primary w-100"
                  disabled={isInCart(gameId)}
                  onClick={handleAddToCart}
                >
                  <i className="bi bi-cart-plus me-1"></i> {isInCart(gameId) ? "En carrito" : "Añadir"}
                </button>
              )}
              <button
                className="btn btn-outline-light w-100 add-cart-btn"
                onClick={() => navigate(`/game/${gameId}`)}
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
