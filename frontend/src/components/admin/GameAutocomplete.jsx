import { useState, useEffect, useRef } from "react";
import { gamesAll } from "../../api/api";
import "./GameAutocomplete.css";

/**
 * Componente Selector de Juegos con Autocompletado Inteligente y Debounce (400ms).
 * Evita bucles infinitos aislando el efecto de búsqueda al valor ingresado por el usuario.
 */
export default function GameAutocomplete({
  selectedGames = [],
  onSelectGame,
  onRemoveGame,
  catalogGames = []
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const containerRef = useRef(null);
  const catalogGamesRef = useRef(catalogGames);

  // Mantener la referencia actualizada del catálogo sin re-disparar el efecto de búsqueda
  useEffect(() => {
    catalogGamesRef.current = catalogGames;
  }, [catalogGames]);

  // Escuchar clics fuera para cerrar el menú desplegable automáticamente
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Efecto con debounce de 400ms para consultar el backend/IGDB por término digitado
  useEffect(() => {
    const trimmed = query.trim();

    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setDropdownOpen(false);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      setDropdownOpen(true);
      try {
        const response = await gamesAll({ search: trimmed });
        const fetchedGames = response.games || [];

        // Combinar resultados locales de catálogo con la búsqueda de IGDB evitando duplicados
        const combinedMap = new Map();

        // 1. Coincidencias locales de catálogo
        (catalogGamesRef.current || []).forEach((g) => {
          if (g.nombre?.toLowerCase().includes(trimmed.toLowerCase())) {
            combinedMap.set(Number(g.id_juego), {
              id: Number(g.id_juego),
              name: g.nombre,
              cover: g.imagen_url || "/nulls/placeholder-game.svg",
              price: g.precio_actual || 29.99,
              isCatalog: true
            });
          }
        });

        // 2. Coincidencias de API IGDB
        fetchedGames.forEach((g) => {
          const gId = Number(g.id);
          if (!combinedMap.has(gId)) {
            combinedMap.set(gId, {
              id: gId,
              name: g.name,
              cover: g.image || "/nulls/placeholder-game.svg",
              price: g.price || 29.99,
              isCatalog: false
            });
          }
        });

        setResults(Array.from(combinedMap.values()).slice(0, 10));
      } catch (err) {
        console.error("Error consultando autocompletado de juegos:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Manejar selección de un juego
  const handleSelect = (game) => {
    if (onSelectGame) {
      onSelectGame(game);
    }
    setQuery("");
    setDropdownOpen(false);
  };

  return (
    <div className="game-autocomplete-container" ref={containerRef}>
      <label className="form-label text-white small fw-bold">
        <i className="bi bi-search me-1 text-info"></i> Buscar y Seleccionar Juegos
      </label>

      {/* Input de Búsqueda con Spinner integrado */}
      <div className="autocomplete-input-wrapper">
        <i className="bi bi-search input-search-icon"></i>
        <input
          type="text"
          className="form-control autocomplete-input"
          placeholder="Escribe el nombre del juego (ej. Minecraft, FIFA, Spider-Man)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length >= 2 && setDropdownOpen(true)}
        />
        {loading && (
          <div className="input-spinner spinner-border spinner-border-sm text-info" role="status">
            <span className="visually-hidden">Buscando...</span>
          </div>
        )}
      </div>

      {/* Dropdown de Resultados Relevantes */}
      {dropdownOpen && (
        <div className="autocomplete-dropdown shadow-lg">
          {loading ? (
            <div className="dropdown-loading-item">
              <span className="spinner-border spinner-border-sm me-2 text-info"></span>
              Buscando títulos más relevantes...
            </div>
          ) : results.length === 0 ? (
            <div className="dropdown-empty-item">
              <i className="bi bi-exclamation-circle me-1 text-warning"></i> No se encontraron juegos coincidentes.
            </div>
          ) : (
            results.map((game) => {
              const isSelected = selectedGames.some(
                (sg) => (typeof sg === "object" ? sg.id || sg.id_juego : sg) === game.id
              );

              return (
                <div
                  key={game.id}
                  className={`dropdown-game-item ${isSelected ? "selected" : ""}`}
                  onClick={() => !isSelected && handleSelect(game)}
                >
                  <img
                    src={game.cover || "/nulls/placeholder-game.svg"}
                    alt={game.name}
                    className="dropdown-game-img"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/nulls/placeholder-game.svg";
                    }}
                  />
                  <div className="dropdown-game-info">
                    <span className="dropdown-game-name text-truncate">{game.name}</span>
                    <small className="dropdown-game-meta text-muted">
                      {game.isCatalog ? "En Catálogo Comercial" : "Base de Datos IGDB"}
                    </small>
                  </div>
                  <div className="dropdown-game-price">
                    ${Number(game.price).toFixed(2)}
                    {isSelected && (
                      <span className="badge bg-success ms-2">
                        <i className="bi bi-check"></i> Añadido
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Chips / Etiquetas de Juegos Seleccionados */}
      {selectedGames.length > 0 && (
        <div className="selected-games-chips mt-2">
          <small className="d-block text-muted mb-1">
            Juegos incluidos ({selectedGames.length}):
          </small>
          <div className="chips-flex">
            {selectedGames.map((item) => {
              const gameObj = typeof item === "object" ? item : { id: item, name: `Juego #${item}` };
              const gId = gameObj.id || gameObj.id_juego;
              const gName = gameObj.name || gameObj.nombre || `Juego #${gId}`;

              return (
                <span key={gId} className="game-tag-chip">
                  <span className="chip-name text-truncate">{gName}</span>
                  <button
                    type="button"
                    className="btn-chip-remove"
                    title="Remover juego"
                    onClick={() => onRemoveGame(gId)}
                  >
                    &times;
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
