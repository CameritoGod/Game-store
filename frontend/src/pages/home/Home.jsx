import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/useAuth.js";

// Components
import CardGame from "../../components/cardGame.jsx/card/CardGame";
import SkeletonCard from "../../components/cardGame.jsx/skeleton/SkeletonCard";
import SkeletonTendencia from "../../components/cardGame.jsx/skeletonTendencia/SkeletonTendencia.jsx";
import Navbar from "../../components/navbar/Navbar.jsx";
import Sidebar from "../../components/Sidebar/Sidebar.jsx";
import CardTendencia from "../../components/cardGame.jsx/cardTendencia/CardTendencia.jsx";
import OfferCard from "../../components/cardGame.jsx/offerCard/OfferCard.jsx";
import Footer from "../../components/footer/Footer.jsx";

// API Services
import {
  gamesTraiding,
  gamesRecommendations,
  getAllDiscounts,
  getMoreGames
} from "../../api/api.js";

import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Estados independientes de carga
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [loadingMoreGames, setLoadingMoreGames] = useState(true);

  // Estados de almacenamiento de datos
  const [trendingGames, setTrendingGames] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [offers, setOffers] = useState([]);
  const [moreGames, setMoreGames] = useState([]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirección en caso de usuario administrador
  useEffect(() => {
    if (user?.role === "admin") {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate]);

  // Ejecución paralela de peticiones a la API
  useEffect(() => {
    let isMounted = true;

    const fetchAllData = () => {
      // 1. Tendencias
      gamesTraiding()
        .then((data) => {
          if (isMounted) setTrendingGames(data);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          if (isMounted) setLoadingTrending(false);
        });

      // 2. Recomendados
      gamesRecommendations()
        .then((data) => {
          if (isMounted) setRecommendations(data);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          if (isMounted) setLoadingRecommendations(false);
        });

      // 3. Ofertas de la semana
      getAllDiscounts()
        .then((data) => {
          if (isMounted) setOffers(data);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          if (isMounted) setLoadingOffers(false);
        });

      // 4. Catálogo general / Más Juegos
      getMoreGames()
        .then((data) => {
          if (isMounted) setMoreGames(data);
        })
        .catch((err) => console.error(err))
        .finally(() => {
          if (isMounted) setLoadingMoreGames(false);
        });
    };

    fetchAllData();

    return () => {
      isMounted = false;
    };
  }, []);

  const hasAllFinishedLoading =
    !loadingTrending &&
    !loadingRecommendations &&
    !loadingOffers &&
    !loadingMoreGames;

  const hasNoData =
    trendingGames.length === 0 &&
    recommendations.length === 0 &&
    offers.length === 0 &&
    moreGames.length === 0;

  return (
    <>
      <Navbar user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="container-fluid home-content mt-3">
        {/* SECCIÓN TENDENCIAS */}
        <section className="px-4 mb-5">
          <h3 className="text-white mb-4 title-tendencias" id="trending">
            Juegos en tendencia
          </h3>
          {loadingTrending ? (
            <div className="row">
              <SkeletonTendencia />
            </div>
          ) : (
            trendingGames.length > 0 && <CardTendencia games={trendingGames} />
          )}
        </section>

        {/* SECCIÓN RECOMENDADOS */}
        <section className="container-fluid px-4 section-recomended" id="recomemend">
          <div className="section-header">
            <h3 className="text-white mb-1">Juegos recomendados</h3>
            {!loadingRecommendations && <span className="scroll-hint">Desliza →</span>}
          </div>

          <div className="recomended-scroll">
            {loadingRecommendations
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-wrapper">
                    <SkeletonCard />
                  </div>
                ))
              : recommendations.map((game) => (
                  <div key={game.id} className="card-wrapper">
                    <CardGame {...game} />
                  </div>
                ))}
          </div>
        </section>

        {/* SECCIÓN OFERTAS */}
        {(loadingOffers || offers.length > 0) && (
          <section className="container-fluid px-4 section-offers mt-5" id="offers">
            <div className="section-header mb-3">
              <h3 className="text-white mb-0">Ofertas de la semana</h3>
            </div>
            <div className="offers-grid">
              {loadingOffers
                ? [...Array(2)].map((_, i) => <div key={i} className="offer-skeleton" />)
                : offers.map((offer) => <OfferCard key={offer.id} {...offer} />)}
            </div>
          </section>
        )}

        {/* SECCIÓN MÁS JUEGOS */}
        <section className="container-fluid px-4 section-more-games mt-5">
          <div className="section-header mb-3">
            <h3 className="text-white mb-0">Más juegos</h3>
          </div>
          <div className="more-games-grid">
            {loadingMoreGames
              ? [...Array(6)].map((_, i) => <SkeletonCard key={i} />)
              : moreGames.map((game) => (
                  <CardGame key={game.id} {...game} />
                ))}
          </div>

          <div className="more-games-cta mt-4">
            <button
              className="btn btn-outline-primary px-5"
              onClick={() => navigate("/AllGame")}
            >
              <span className="game-more">Ver muchos más juegos →</span>
            </button>
          </div>
        </section>

        {/* FALLBACK EN CASO DE FALLO DE CONEXIÓN O DATOS VACÍOS */}
        {hasAllFinishedLoading && hasNoData && (
          <div className="alert alert-primary d-flex justify-content-center mt-5" role="alert">
            No se encontraron juegos en este momento. Intenta recargar la página.
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}