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
}) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
        </div>

        <div className="card-body d-flex flex-column">
          <h5>{title}</h5>
          <small className="text-secondary">{genre} • {year}</small>

          <div className="mt-auto">
            <p className="price">{price}</p>

             <div className="d-flex gap-2 card-buttons">
                  <button
                      className="btn btn-primary w-100"
                      onClick={() =>
                      addToCart({ id, title, price, image })
                            }
                          >
                            <i className="bi bi-cart-plus"></i> Añadir al carrito
                          </button>
                <button 
                  className="btn btn-outline-light w-100 add-cart-btn"
                  onClick={
                    () => navigate(`/game/${id}`)
                  }
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

