import "./SkeletonTendencia.css";

export default function SkeletonTendencia() {
  return (
    <div className="tendencia-container skeleton-tendencia">
      {/* RÉPLICA CARD GRANDE (Izquierda) */}
      <div className="tendencia-main skeleton-main">
        <div className="tendencia-overlay skeleton-overlay">
          {/* Badge */}
          <div className="skeleton-line badge-skeleton"></div>
          {/* Título */}
          <div className="skeleton-line title-skeleton"></div>
          {/* Género */}
          <div className="skeleton-line genre-skeleton"></div>
          {/* Descripción (2 líneas) */}
          <div className="skeleton-line desc-skeleton"></div>
          <div className="skeleton-line desc-skeleton short"></div>

          {/* Info (Rating, Year, Price) */}
          <div className="tendencia-info skeleton-info">
            <div className="skeleton-line info-item"></div>
            <div className="skeleton-line info-item"></div>
            <div className="skeleton-line info-item price-item"></div>
          </div>

          {/* Acciones */}
          <div className="tendencia-actions skeleton-actions">
            <div className="skeleton-line btn-skeleton"></div>
            <div className="skeleton-line btn-skeleton"></div>
          </div>
        </div>
      </div>

      {/* RÉPLICA MINI CARDS (Derecha - generamos 4) */}
      <div className="tendencia-list skeleton-list">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="tendencia-mini skeleton-mini">
            {/* Imagen miniatura */}
            <div className="skeleton-img-mini"></div>
            {/* Texto al lado */}
            <div className="skeleton-text-mini">
              <div className="skeleton-line mini-title"></div>
              <div className="skeleton-line mini-subtitle"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}