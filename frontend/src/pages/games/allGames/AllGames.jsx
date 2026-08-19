/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";

// Components
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import CardGame from "../../../components/cardGame.jsx/card/CardGame";
import SkeletonCard from "../../../components/cardGame.jsx/skeleton/SkeletonCard";

// API
import { gamesAll } from "../../../api/api";

// CSS
import "./allGame.css";

export default function AllGames() {
  const { user } = useAuth();

  const [searchParams, setSearchParams] = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [games, setGames] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalGames, setTotalGames] = useState(0);

  const [filters, setFilters] = useState({
    genre: searchParams.get("genre") || "all",
    year: searchParams.get("year") || "",
    search: searchParams.get("search") || ""
  });

  useEffect(() => {
    setFilters({
      genre: searchParams.get("genre") || "all",
      year: searchParams.get("year") || "",
      search: searchParams.get("search") || ""
    });

    setPage(Number(searchParams.get("page")) || 1);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [filters.genre, filters.year, filters.search]);

//No borra el serch del URL
  useEffect(() => {
    setSearchParams({
      genre: filters.genre,
      year: filters.year,
      search: filters.search,
      page
    });
  }, [filters, page]);

  // 🎮 Fetch juegos
  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const data = await gamesAll({
          page,
          genre: filters.genre,
          year: filters.year,
          search: filters.search
        });

        setGames(data.games);
        setTotalGames(data.total);
      } catch (error) {
        console.error("Error cargando juegos", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [page, filters]);

  // ⬆ Scroll top al cambiar página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  // 🔄 Reset página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [filters.genre, filters.year]);

  return (
    <>
      <Navbar
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="container-fluid allgames-container pt-2 mt-4">
        {/* Header */}
        <div className="allgames-header px-4">
          <h2 className="text-white">
            Todos los juegos <i className="bi bi-controller"></i>
          </h2>
          <p className="text-white">
            Explora nuestro catálogo completo
          </p>
        </div>

        {/* Filtros */}
        <div className="px-4 mt-4">
          <div className="row g-3 justify-content-end">
            {/* Género */}
            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label text-white fw-bold">
                Género
              </label>
              <select
                className="form-select"
                value={filters.genre}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    genre: e.target.value.toLowerCase()
                  }))
                }
              >
                <option value="all">Todos</option>
                <option value="action">Acción</option>
                <option value="5">RPG</option>
                <option value="shooter">Shooter</option>
                <option value="indie">Indie</option>
                <option value="strategy">Estrategia</option>
              </select>
            </div>

            {/* Año */}
            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label text-white fw-bold">
                Año
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Ej: 2022"
                value={filters.year}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    year: e.target.value
                  }))
                }
              />
            </div>
          </div>
        </div>

        {/* Grid */}
        <section className="px-4 mt-4">
          <div className="row g-4">
            {loading
              ? [...Array(12)].map((_, i) => (
                  <div key={i} className="col-12 col-md-4 col-lg-3">
                    <SkeletonCard />
                  </div>
                ))
              : games.map(game => (
                  <div key={game.id} className="col-12 col-md-4 col-lg-3">
                    <CardGame
                      id={game.id}
                      title={game.name}
                      image={game.image}
                      rating={game.rating}
                      year={game.released?.split("-")[0] || "N/A"}
                      genre={game.genres?.[0] || "Unknown"}
                      price={(Math.random() * 50 + 10).toFixed(2)}
                    />
                  </div>
                ))}
          </div>
        </section>

        {/* Paginación */}
        <div className="pagination-container mt-5">
          <button
            className="btn btn-outline-primary"
            disabled={page === 1}
            onClick={() => setPage(prev => prev - 1)}
          >
            ← Anterior
          </button>

          <span className="page-indicator">Página {page}</span>

          <button
            className="btn btn-outline-primary"
            onClick={() => setPage(prev => prev + 1)}
          >
            Siguiente →
          </button>
        </div>
      </main>
    </>
  );
}
