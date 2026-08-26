import { useCart } from "../../../context/CartContext";
import "./OfferCard.css";

export default function OfferCard({
  id,
  id_juego,
  title,
  name,
  image,
  cover,
  imagen_url,
  price,
  oldPrice,
  precio_original,
  discount,
  porcentaje,
  isOwned,
  inLibrary
}) {
  const { addToCart, isInCart } = useCart();
  const gameId = Number(id || id_juego);
  const gameTitle = title || name || `Juego #${gameId}`;
  const gameImage = image || cover || imagen_url || "/nulls/placeholder-game.svg";

  const isPurchased = Boolean(isOwned || inLibrary);

  // Formateo de precio base y porcentaje de rebaja
  const basePriceNum = parseFloat(String(oldPrice || precio_original || price || 59.99).replace("$", "")) || 59.99;
  const pctNum = parseInt(String(discount || porcentaje || 20).replace(/[^0-9]/g, ""), 10) || 20;

  const finalPriceStr = typeof price === "number"
    ? price.toFixed(2)
    : (basePriceNum * (1 - pctNum / 100)).toFixed(2);

  const handleAdd = () => {
    addToCart({
      id: gameId,
      title: gameTitle,
      image: gameImage,
      price: finalPriceStr,
    });
  };

  return (
    <div className="offer-card">
      <div className="discount-badge">-{pctNum}%</div>
      <img
        src={gameImage}
        alt={gameTitle}
        className="offer-image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/nulls/placeholder-game.svg";
        }}
      />
      <div className="offer-content">
        <h4 className="text-truncate" title={gameTitle}>{gameTitle}</h4>
        <div className="prices">
          <span className="old-price">${basePriceNum.toFixed(2)}</span>
          <span className="new-price">${finalPriceStr}</span>
        </div>
        {isPurchased ? (
          <button className="btn-offer disabled" disabled style={{ opacity: 0.85, background: "#2a2a35" }}>
            <i className="bi bi-check-circle-fill me-1 text-success"></i> En tu biblioteca
          </button>
        ) : (
          <button
            className="btn-offer"
            disabled={isInCart(gameId)}
            onClick={handleAdd}
          >
            {isInCart(gameId) ? "En el carrito" : "Comprar ahora"}
          </button>
        )}
      </div>
    </div>
  );
}