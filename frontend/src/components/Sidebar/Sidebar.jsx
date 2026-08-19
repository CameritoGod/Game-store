import "../../pages/home/Home.css";
import logo from "../../assets/logo/4.png";
import "./sidebar.css";

import { useAuth } from "../../auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { getPurchases } from "../../api/userApi";

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const [library, setLibrary] = useState([]);

    useEffect(() => {
      if (!user) return;
      getPurchases().then(setLibrary);
    }, [user]);


  const filterNavigate = (genre) => {
    navigate(`/allgame?genre=${genre}&page=1`);
    onClose();
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && search.trim()) {
      navigate(`/allgame?search=${search}&page=1`);
      setSearch("");
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {open && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`sidebar ${open ? "open" : ""}`}>
        {/* Header */}
        <div className="sidebar-header">
          <img
            src={logo}
            alt="GameStoreLogo"
            className="img-fluid rounded-pill gameStoreLogo"
            width={100}
          />
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Search bar */}
        <div className="sidebar-search mb-3">
          <input
            type="text"
            placeholder="Buscar juegos..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearch}
          />
          <i className="bi bi-search search-icon"></i>
        </div>

        {/* Sections */}
        <div className="sidebar-section">
          <h6>Explorar</h6>
          <ul>
            <a href="#trending">
              <li onClick={() => navigate("/")}>
                <i className="bi bi-fire"></i> Tendencias / Home
            </li>
            </a>
            <a href="#recomemend">
              <li onClick={() => navigate("/")}>
                <i className="bi bi-star"></i>
                Juegos recomendados
              </li>
            </a>
            <a href="#offers">
              <li onClick={() => navigate("/")}>
                <i className="bi bi-clock-history"></i>
                Ofertas temporales
              </li>
            </a>
          </ul>
        </div>

        <div className="sidebar-section">
          <h6>Categorías</h6>
          <ul>
            <li onClick={() => filterNavigate("action")}>
              <i className="bi bi-lightning"></i>
              Acción
            </li>
            <li onClick={() => filterNavigate("5")}>
              <i className="bi bi-controller"></i>
              RPG
            </li>
            <li onClick={() => filterNavigate("shooter")}>
              <i className="bi bi-crosshair"></i>
              Shooter
            </li>
            <li onClick={() => filterNavigate("indie")}>
              <i className="bi bi-puzzle"></i>
              Indie
            </li>
            <li onClick={() => filterNavigate("strategy")}>
              <i className="bi bi-diagram-3"></i>
              Estrategia
            </li>
          </ul>
        </div>

      {/* Biblioteca */}
        <div className="sidebar-section">
          <h6>Tu biblioteca</h6>
          <ul className="library-list">
            {library.length === 0 ? (
              <li>No tienes juegos en tu biblioteca</li>
            ) : (
              library.map((game) => (
                <li 
                  key={game.id_juego}
                  onClick={() => {
                    navigate(`/game/${game.id_juego}`);
                    onClose();
                  }}
                >
                  <i className="bi bi-play-circle"></i> {game.nombre}
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="sidebar-footer">
          <span>© 2025 GameStore</span>
        </div>
      </aside>
    </>
  );
}