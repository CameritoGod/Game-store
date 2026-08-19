import { useCart } from "../../../context/CartContext";

export default function OfferCard({ id, title, image, oldPrice, discount }) {
  const { addToCart, isInCart } = useCart();

  // Convertimos a número por si acaso vienen como string de la API
  const price = parseFloat(oldPrice);
  const percentage = parseInt(discount);

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
      <img src={image} alt={title} className="offer-image" />
      <div className="offer-content">
        <h4>{title}</h4>
        <div className="prices">
          <span className="old-price">${price.toFixed(2)}</span>
          <span className="new-price">${newPrice}</span>
        </div>
        <button
          className="btn-offer"
          disabled={isInCart(id)}
          onClick={handleAdd}
        >
          {isInCart(id) ? "En el carrito" : "Comprar"}
        </button>
      </div>
    </div>
  );
}