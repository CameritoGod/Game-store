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
import { gamesAll, getGenres } from "../../../api/api";

// CSS
import "./allGame.css";

export default function AllGames() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [genresList, setGenresList] = useState([]);

  const [page, setPage] = useState(
    Number(searchParams.get("page")) || 1
  );

  const [games, setGames] = useState([]);
  const [totalGames, setTotalGames] = useState(0);

  const [filters, setFilters] = useState({
    genre: searchParams.get("genre") || "all",
    year: searchParams.get("year") || "",
    search: searchParams.get("search") || ""
  });

  // Estado local para la entrada de año con debounce
  const [inputYear, setInputYear] = useState(searchParams.get("year") || "");

  // Cargar lista de géneros desde el backend
  useEffect(() => {
    getGenres().then(setGenresList);
  }, []);

  // Sincronizar parámetros de URL con el estado local
  useEffect(() => {
    const genreParam = searchParams.get("genre") || "all";
    const yearParam = searchParams.get("year") || "";
    const searchParam = searchParams.get("search") || "";
    const pageParam = Number(searchParams.get("page")) || 1;

    setFilters({
      genre: genreParam,
      year: yearParam,
      search: searchParam
    });
    setInputYear(yearParam);
    setPage(pageParam);
  }, [searchParams]);

  // Debounce y validación para la entrada de texto del año (espera 450ms o año de 4 dígitos)
  useEffect(() => {
    const handler = setTimeout(() => {
      const trimmed = inputYear.trim();
      if (trimmed === "" || (trimmed.length === 4 && !isNaN(trimmed))) {
        if (filters.year !== trimmed) {
          setFilters((prev) => ({ ...prev, year: trimmed }));
          setPage(1);
        }
      }
    }, 450);

    return () => clearTimeout(handler);
  }, [inputYear]);

  // Reset de página al cambiar filtros
  useEffect(() => {
    setPage(1);
  }, [filters.genre, filters.search]);

  // Actualizar URL cuando cambian los filtros o la página
  useEffect(() => {
    setSearchParams({
      genre: filters.genre,
      year: filters.year,
      search: filters.search,
      page
    });
  }, [filters, page]);

  // 🎮 Fetch juegos con manejo seguro de errores
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

        if (data && Array.isArray(data.games)) {
          setGames(data.games);
          setTotalGames(data.total || data.games.length);
        } else {
          setGames([]);
          setTotalGames(0);
        }
      } catch (error) {
        console.error("Error cargando juegos:", error);
        setGames([]);
        setTotalGames(0);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [page, filters]);

  // ⬆ Scroll top al cambiar de página
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

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
                  setFilters((prev) => ({
                    ...prev,
                    genre: e.target.value
                  }))
                }
              >
                <option value="all">Todos los géneros</option>
                {genresList.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Año */}
            <div className="col-12 col-md-4 col-lg-3">
              <label className="form-label text-white fw-bold">
                Año (4 dígitos)
              </label>
              <input
                type="number"
                className="form-control"
                placeholder="Ej: 2022"
                value={inputYear}
                onChange={(e) => setInputYear(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Grid de juegos o Estado sin resultados */}
        <section className="px-4 mt-4">
          {loading ? (
            <div className="row g-4">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="col-12 col-md-4 col-lg-3">
                  <SkeletonCard />
                </div>
              ))}
            </div>
          ) : games.length > 0 ? (
            <div className="row g-4">
              {games.map((game) => (
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
          ) : (
            <div className="no-results-container text-center fade-in">
              <i className="bi bi-search text-secondary display-3 mb-3 d-block"></i>
              <h4 className="text-white fw-bold">No se encontraron juegos</h4>
              <p className="text-secondary mt-2">
                No hay resultados que coincidan con la búsqueda o filtros aplicados.
              </p>
              <button
                className="btn btn-outline-primary px-4 mt-3"
                onClick={() => {
                  setInputYear("");
                  setFilters({ genre: "all", year: "", search: "" });
                }}
              >
                <i className="bi bi-arrow-counterclockwise"></i> Limpiar filtros
              </button>
            </div>
          )}
        </section>

        {/* Paginación sincronizada (Se oculta si no hay resultados) */}
        {!loading && games.length > 0 && (
          <div className="pagination-container mt-5">
            <button
              className="btn btn-outline-primary"
              disabled={page === 1}
              onClick={() => setPage((prev) => prev - 1)}
            >
              ← Anterior
            </button>

            <span className="page-indicator">Página {page}</span>

            <button
              className="btn btn-outline-primary"
              disabled={games.length < 12}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>
    </>
  );
}
