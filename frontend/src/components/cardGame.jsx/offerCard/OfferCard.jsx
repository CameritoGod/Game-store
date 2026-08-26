import { useCart } from "../../../context/CartContext";
import "./OfferCard.css";

export default function OfferCard({ id, title, image, oldPrice, discount, isOwned, inLibrary }) {
  const { addToCart, isInCart } = useCart();

  const isPurchased = Boolean(isOwned || inLibrary);

  // Convertimos a número por si acaso vienen como string de la API
  const price = parseFloat(String(oldPrice).replace("$", "")) || 59.99;
  const percentage = parseInt(discount) || 30;

  const newPrice = (price - (price * percentage) / 100).toFixed(2);

  const handleAdd = () => {
    addToCart({
      id,
      title,
      image,
      price: newPrice,
    });
  };

  return (
    <div className="offer-card">
      <div className="discount-badge">-{percentage}%</div>
      <img
        src={image || "/nulls/placeholder-game.svg"}
        alt={title}
        className="offer-image"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "/nulls/placeholder-game.svg";
        }}
      />
      <div className="offer-content">
        <h4>{title}</h4>
        <div className="prices">
          <span className="old-price">${price.toFixed(2)}</span>
          <span className="new-price">${newPrice}</span>
        </div>
        {isPurchased ? (
          <button className="btn-offer disabled" disabled style={{ opacity: 0.85, background: "#2a2a35" }}>
            <i className="bi bi-check-circle-fill me-1 text-success"></i> En tu biblioteca
          </button>
        ) : (
          <button
            className="btn-offer"
            disabled={isInCart(id)}
            onClick={handleAdd}
          >
            {isInCart(id) ? "En el carrito" : "Comprar"}
          </button>
        )}
      </div>
    </div>
  );
}