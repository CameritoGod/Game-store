import { useState } from "react";
import PropTypes from "prop-types";

/**
 * Helper para formatear URLs de imágenes de IGDB a alta resolución.
 * @param {string} url - URL relativa provista por la API.
 * @param {string} size - Tamaño deseado (ej. t_cover_big, t_1080p).
 * @returns {string} URL formateada completa.
 */
const formatIgdbImage = (url, size = "t_1080p") => {
  if (!url) return "https://via.placeholder.com/1080x720?text=No+Image";
  return url.replace("//", "https://").replace("t_thumb", size);
};

export default function CardTendencia({ games }) {
  // Estado para rastrear el juego seleccionado en la tarjeta principal
  const [selectedGameIndex, setSelectedGameIndex] = useState(0);

  if (!games || games.length === 0) {
    return null;
  }

  const currentGame = games[selectedGameIndex];

  return (
    <div className="tendencia-container">
      {/* TARJETA PRINCIPAL */}
      <div className="tendencia-main">
        <div
          className="tendencia-media image"
          style={{
            backgroundImage: `url(${formatIgdbImage(currentGame.cover?.url, "t_1080p")})`
          }}
        />
        
        <div className="tendencia-overlay">
          <span className="badge badge-trending text-white px-3 py-1 rounded-pill">
            Destacado #{selectedGameIndex + 1}
          </span>
          <h2>{currentGame.name}</h2>
          
          <p className="genre mb-1">
            {currentGame.genres
              ? currentGame.genres.map((g) => g.name).join(", ")
              : "Sin género especificado"}
          </p>

          <p className="description">
            {currentGame.summary
              ? currentGame.summary.length > 180
                ? `${currentGame.summary.substring(0, 180)}...`
                : currentGame.summary
              : "Sin descripción disponible."}
          </p>

          <div className="tendencia-info">
            <span>
              Valoración: <strong>{currentGame.rating ? `${Math.round(currentGame.rating)}/100` : "N/A"}</strong>
            </span>
          </div>

          <div className="tendencia-actions">
            <button className="btn btn-primary px-4">Ver detalles</button>
          </div>
        </div>
      </div>

      {/* LISTA LATERAL DE MINI CARDS */}
      <div className="tendencia-list">
        {games.map((game, index) => (
          <div
            key={game.id}
            className={`tendencia-mini ${index === selectedGameIndex ? "active" : ""}`}
            onClick={() => setSelectedGameIndex(index)}
          >
            <img
              src={formatIgdbImage(game.cover?.url, "t_cover_big")}
              alt={game.name}
            />
            <div className="d-flex flex-column justify-content-center">
              <h6>{game.name}</h6>
              <span>
                {game.rating ? `${Math.round(game.rating)} / 100` : "Sin puntuación"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

CardTendencia.propTypes = {
  games: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      summary: PropTypes.string,
      rating: PropTypes.number,
      cover: PropTypes.shape({
        url: PropTypes.string
      }),
      genres: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string
        })
      )
    })
  ).isRequired
};