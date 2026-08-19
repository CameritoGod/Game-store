/* eslint-disable react-hooks/purity */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth.js";

//Componentes
import Navbar from "../../../components/navbar/Navbar.jsx";
import Sidebar from "../../../components/Sidebar/Sidebar.jsx";

//Card context
import { useCart } from "../../../context/CartContext.jsx";

//Consumo de api
import { getGameById, gamesRecommendations } from "../../../api/api.js";
import { addFavorite, getFavorites, getPurchases, deleteFavorite } from "../../../api/userApi";


//CSS propio de la pagina
import "./gameDetail.css";

export default function GameDetail() {
  //Parametros de los detalles
  //del juego
  const { id } = useParams();

  //Estados del carrito
  const { addToCart, isInCart } = useCart();

  //Usuario logueado
  const { user } = useAuth(); 

  //Estados
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [game, setGame] = useState(null);
  const [relatedGames, setRelatedGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState("");

  const [isFavorite, setIsFavorite] = useState(false);
  const [isOwned, setIsOwned] = useState(false);

  const navigate = useNavigate();

  // Fetch game detail
  useEffect(() => {
    const fetchGame = async () => {
      
      setLoading(true);

      const data = await getGameById(id);

      setGame(data);
      setMainImage(data.image); // Primera imagen del carrusel
      setLoading(false);
    };

    fetchGame();
  }, [id]);

  // Fetch related games
  useEffect(() => {
    if (!game?.genres?.length) return;
    
    const fetchRelated = async () => {
      const mainGenre = game.genres[0]; // primer género
      const data = await gamesRecommendations({
        genre: mainGenre,
        limit: 7
      });
    
      // Evitar que salga el mismo juego
      setRelatedGames(data.filter(g => g.id !== game.id));
    };
  
    fetchRelated();
  }, [game]);

  useEffect(() => {
    if (!user || !game) return;
    
    const checkStatus = async () => {
      try {
        // FAVORITOS
        const favorites = await getFavorites();
        setIsFavorite(favorites.some(f => f.id_juego === game.id));
      
        // LIBRERÍA / COMPRAS
        const purchases = await getPurchases();
        setIsOwned(purchases.some(p => p.id_juego === game.id));
      
      } catch (err) {
        console.error("Error comprobando estado del juego", err);
      }
    };
  
    checkStatus();
  }, [user, game]);


  const handleFavoriteToggle = async () => {
    if (!user) {
      alert("Debes iniciar sesión");
      return;
    }

    try {
      if (isFavorite) {
        // 👈 AQUÍ VA
        await deleteFavorite(game.id);
        setIsFavorite(false);
      } else {
        await addFavorite({
          id_juego: game.id,
          nombre: game.name,
          imagen_url: game.image
        });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Error al actualizar favorito:", error);
    }
  };


  //Funcion para comverion de formato
  //de la fecha de los juegos
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES'); // Salida en formato español: 25/12/2025
  };


  if (loading) {
    return (
      <div className="game-detail-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!game) return <p className="text-center text-danger">Juego no encontrado</p>;

  const price = (Math.random() * (60 - 15) + 15).toFixed(2);

  return (
    <>
      <Navbar user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="game-detail-container container-fluid pt-5 mt-4">
        <div className="row">
        {/* CARRUSEL DE IMÁGENES */}
        <div className="col-12 col-md-5">
          <div className="image-carousel">

            {/* Imagen principal */}
            <img
              src={mainImage}
              alt={game.name}
              className="main-game-image fade-image"
              key={mainImage} // fuerza animación al cambiar
            />

            {/* Thumbnails */}
            <div className="thumbnails">
              {[
                ...(game.screenshots || []),
                ...relatedGames.flatMap(g => g.screenshots || [])
              ]
                .slice(0, 6)
                .map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`thumb-${i}`}
                    className={`thumbnail ${
                      img === mainImage ? "active-thumb" : ""
                    }`}
                    onClick={() => setMainImage(img)}
                  />
                ))}
            </div>
              
          </div>
        </div>


          {/* INFO DEL JUEGO */}
          <div className="col-12 col-md-7 game-contenedor-details-info p-4">
            <div className="game-detail-info p-4">
              <h1 className="game-title">{game.name}</h1>

              <div className="game-meta">
                <span><i className="bi bi-star-fill text-warning"></i> {game.rating}</span>
                <span><i className="bi bi-calendar3 text-info"></i> {formatDate(game.released)}</span>              
              </div>

              <div className="game-genres">
                {game.genres.map((g, i) => (
                  <span key={i} className="genre-badge">{g}</span>
                ))}
              </div>

              <div className={`game-description ${showFullDesc ? "expanded" : ""}`}>
                {game.description}
              </div>

              <button
                className="btn btn-link text-info p-0 mt-1"
                onClick={() => setShowFullDesc(!showFullDesc)}
              >
                {showFullDesc ? "Leer menos ▲" : "Leer más ▼"}
              </button>

              <h3 className="game-price">${price}</h3>

              <div className="game-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    if (isOwned) {
                      navigate(`/play/${game.id}`); // o donde se juegue
                    } else {
                      addToCart({
                        id: game.id,
                        title: game.name,
                        image: game.image,
                        price
                      });
                    }
                  }}
                >
                  {isOwned ? "Jugar" : isInCart(game.id) ? "En el carrito" : "Añadir al carrito"}
                  <i className={`bi ${isOwned ? "bi-play-fill" : "bi-cart-plus"}`} />
                </button>

                <button
                  className={`btn ${isFavorite ? "btn-danger" : "btn-outline-light"}`}
                  onClick={handleFavoriteToggle}
                >
                  {isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
                  <i className={`bi ${isFavorite ? "bi-heart-fill text-light" : "bi-heart"} text-danger`}></i>
                </button>

              </div>
            </div>
          </div>
        </div>

        {/* JUEGOS RELACIONADOS */}
        <section className="related-games mt-5">
          <h3><i className="bi bi-dpad text-primary"></i> Juegos relacionados</h3>
          <div className="related-grid">
            {relatedGames.map((g) => (
              <div key={g.id} className="related-card d-flex flex-column justify-content-center aling-item-center">
                <img src={g.image} alt={g.title} />
                <h5>{g.title}</h5>
                <span className="fs-6 text-success">${(Math.random() * (60 - 15) + 15).toFixed(2)}</span>
                  <div className="p-1">
                    <button className="btn btn-outline-light" onClick={()=>{
                      navigate(`/game/${g.id}`)
                    }}>
                      Ver detalles
                    </button>
                  </div>
              </div>
            ))}
          </div>
        </section>

        {/* REVIEWS */}
        <section className="reviews mt-5">
          <h3><i className="bi bi-chat-left-text text-primary"></i> Reseñas de usuarios</h3>
          <div className="reviews-list">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="review-card">
                <strong>Usuario {i + 1}</strong>
                <strong className="review-star">⭐⭐⭐⭐</strong>
                <p>Este juego es increíble, lo recomiendo mucho!</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
