import { useEffect, useState } from "react";
import { useAuth } from "../../../auth/useAuth";
import { useToast } from "../../../context/useToast";
import GameAutocomplete from "../../../components/admin/GameAutocomplete";
import {
  getAdminMetrics,
  getAllPurchases,
  getCatalog,
  setCatalogPrice,
  toggleCatalogStatus,
  getDiscounts,
  addDiscount,
  deleteDiscount
} from "../../../api/adminApi";
import "./AdminDashboard.css";
import { Link } from 'react-router-dom';

/**
 * Formatea cadenas de fecha (ISO/UTC) a un formato legible en español (ej. "15/08/2026").
 */
function formatDateReadable(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const [activeTab, setActiveTab] = useState("metrics");
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Estados de datos
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    monthRevenue: 0,
    monthSales: 0,
    totalSales: 0,
    averageTicket: 0,
    topSellingGame: null,
    totalUsers: 0,
    activeDiscounts: 0
  });
  const [purchases, setPurchases] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  // Estados de formularios y selección
  const [selectedGameForPrice, setSelectedGameForPrice] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [catalogSelectedGames, setCatalogSelectedGames] = useState([]);

  const [discountForm, setDiscountForm] = useState({
    nombre: "",
    descripcion: "",
    porcentaje: "",
    fecha_inicio: new Date().toISOString().split("T")[0],
    fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
    selectedGames: []
  });

  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [m, p, c, d] = await Promise.all([
        getAdminMetrics().catch(() => ({
          totalRevenue: 0,
          monthRevenue: 0,
          monthSales: 0,
          totalSales: 0,
          averageTicket: 0,
          topSellingGame: null,
          totalUsers: 0,
          activeDiscounts: 0
        })),
        getAllPurchases().catch(() => []),
        getCatalog().catch(() => []),
        getDiscounts().catch(() => [])
      ]);
      setMetrics(m);
      setPurchases(p);
      setCatalog(c);
      setDiscounts(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Actualizar precio de juego en catálogo
  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!selectedGameForPrice || !newPrice) return;
    try {
      await setCatalogPrice({
        id_juego: selectedGameForPrice.id_juego,
        nombre: selectedGameForPrice.nombre,
        imagen_url: selectedGameForPrice.imagen_url,
        precio_actual: parseFloat(newPrice),
        activo: selectedGameForPrice.activo !== false
      });
      showSuccess("Precio de catálogo actualizado correctamente");
      setSelectedGameForPrice(null);
      setNewPrice("");
      loadAllData();
    } catch (error) {
      showError(error, "Error al actualizar precio");
    }
  };

  // Alternar estado Activo / Inactivo en catálogo
  const handleToggleCatalogStatus = async (game) => {
    try {
      const newStatus = !game.activo;
      await toggleCatalogStatus({
        id_juego: game.id_juego,
        activo: newStatus
      });
      showSuccess(`Juego "${game.nombre}" marcado como ${newStatus ? 'Activo' : 'Inactivo'}`);
      loadAllData();
    } catch (error) {
      showError(error, "Error al cambiar estado");
    }
  };

  // Agregar juego nuevo al catálogo comercial desde autocompletado
  const handleAddGameToCatalog = async (game) => {
    try {
      const defaultPrice = game.price ? parseFloat(game.price) : 29.99;
      await setCatalogPrice({
        id_juego: game.id,
        nombre: game.name,
        imagen_url: game.cover,
        precio_actual: defaultPrice,
        activo: true
      });
      showSuccess(`¡Juego "${game.name}" incorporado al catálogo comercial ($${defaultPrice.toFixed(2)})!`);
      setCatalogSelectedGames([]);
      loadAllData();
    } catch (error) {
      showError(error, "Error al añadir juego al catálogo");
    }
  };

  // Crear campaña de descuento
  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    if (!discountForm.nombre || !discountForm.porcentaje) return;

    const start = new Date(discountForm.fecha_inicio);
    const end = new Date(discountForm.fecha_fin);

    if (end < start) {
      showWarning("La fecha de finalización debe ser igual o posterior a la fecha de inicio.");
      return;
    }

    try {
      await addDiscount({
        nombre: discountForm.nombre,
        descripcion: discountForm.descripcion,
        porcentaje: parseFloat(discountForm.porcentaje),
        fecha_inicio: discountForm.fecha_inicio,
        fecha_fin: discountForm.fecha_fin,
        games: discountForm.selectedGames,
        gameIds: discountForm.selectedGames.map((g) => (typeof g === "object" ? g.id || g.id_juego : g))
      });
      showSuccess("Campaña de descuento creada con éxito");
      setDiscountForm({
        nombre: "",
        descripcion: "",
        porcentaje: "",
        fecha_inicio: new Date().toISOString().split("T")[0],
        fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
        selectedGames: []
      });
      loadAllData();
    } catch (error) {
      showError(error, "Error al crear descuento");
    }
  };

  // Eliminar campaña de descuento
  const handleDeleteDiscount = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta campaña de descuento?")) return;
    try {
      await deleteDiscount(id);
      showSuccess("Campaña de descuento eliminada");
      loadAllData();
    } catch (error) {
      showError(error, "Error al eliminar descuento");
    }
  };

  const handleSelectGameForDiscount = (game) => {
    setDiscountForm((prev) => {
      const exists = prev.selectedGames.some(
        (sg) => (typeof sg === "object" ? sg.id || sg.id_juego : sg) === game.id
      );
      if (exists) return prev;
      return {
        ...prev,
        selectedGames: [...prev.selectedGames, game]
      };
    });
  };

  const handleRemoveGameFromDiscount = (gameId) => {
    setDiscountForm((prev) => ({
      ...prev,
      selectedGames: prev.selectedGames.filter(
        (sg) => (typeof sg === "object" ? sg.id || sg.id_juego : sg) !== gameId
      )
    }));
  };

  return (
    <div className="admin-layout-container">
      {/* BARRA LATERAL (ADMIN SIDEBAR) */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? "mobile-open" : ""}`}>
        <div className="admin-sidebar-header">
          <i className="bi bi-shield-lock-fill admin-logo-icon"></i>
          <div>
            <h1 className="admin-logo-title">ADMIN PANEL</h1>
            <small className="text-muted">Control Hub v2.0</small>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`admin-nav-item ${activeTab === "metrics" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("metrics");
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-speedometer2"></i> Métricas Comerciales
          </button>

          <button
            className={`admin-nav-item ${activeTab === "catalog" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("catalog");
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-controller"></i> Gestión de Catálogo ({catalog.length})
          </button>

          <button
            className={`admin-nav-item ${activeTab === "discounts" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("discounts");
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-percent"></i> Ofertas y Descuentos ({discounts.length})
          </button>

          <button
            className={`admin-nav-item ${activeTab === "purchases" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("purchases");
              setMobileSidebarOpen(false);
            }}
          >
            <i className="bi bi-receipt"></i> Historial de Ventas ({purchases.length})
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <Link
            to={"/"}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-store-preview text-decoration-none mb-2"
            title="Abrir tienda comercial en nueva pestaña"
          >
            <i className="bi bi-box-arrow-up-right me-1"></i> Vista Previa Tienda
          </Link>
          <button
            type="button"
            className="btn-sidebar-logout"
            onClick={logout}
            title="Cerrar sesión de administrador"
          >
            <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* CONTENIDO PRINCIPAL (ADMIN MAIN WRAPPER) */}
      <div className="admin-main-wrapper">
        {/* TOPBAR */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            >
              <i className="bi bi-list"></i>
            </button>
            <div>
              <h5 className="m-0 text-white fw-bold">Panel de Administración</h5>
              <small className="text-muted">Métricas, Catálogo y Descuentos</small>
            </div>
          </div>

          <div className="topbar-user">
            <button className="btn btn-outline-info btn-sm me-2" onClick={loadAllData}>
              <i className="bi bi-arrow-clockwise me-1"></i> Actualizar
            </button>
            <button className="btn btn-outline-danger btn-sm me-3" onClick={logout} title="Cerrar sesión">
              <i className="bi bi-box-arrow-right me-1"></i> Salir
            </button>
            <div className="d-flex align-items-center gap-2">
              <span className="admin-badge">ADMIN</span>
              <span className="text-white small fw-bold">{user?.nickname || user?.nombre || "Admin"}</span>
            </div>
          </div>
        </header>

        {/* ÁREA DE CONTENIDO */}
        <main className="admin-content-area">
          {/* TARJETAS DE MÉTRICAS COMERCIALES REALES (KPI CARDS) */}
          <div className="kpi-grid">
            {/* Ventas del Mes en Curso */}
            <div className="kpi-card kpi-green">
              <div className="kpi-icon-box">
                <i className="bi bi-calendar-check-fill"></i>
              </div>
              <div className="kpi-info">
                <h6>Ventas del Mes</h6>
                <h3>${(metrics.monthRevenue || 0).toFixed(2)}</h3>
                <small className="text-success fw-semibold">
                  <i className="bi bi-bag-check me-1"></i>
                  {metrics.monthSales || 0} compras este mes
                </small>
              </div>
            </div>

            {/* Juego Más Vendido */}
            <div className="kpi-card kpi-purple">
              <div className="kpi-icon-box">
                <i className="bi bi-trophy-fill"></i>
              </div>
              <div className="kpi-info overflow-hidden">
                <h6>Juego Más Vendido</h6>
                {metrics.topSellingGame ? (
                  <div className="d-flex align-items-center gap-2 mt-1">
                    <img
                      src={metrics.topSellingGame.imagen_url || "/nulls/placeholder-game.svg"}
                      alt={metrics.topSellingGame.nombre}
                      style={{ width: 32, height: 32, borderRadius: 6, objectFit: "cover" }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/nulls/placeholder-game.svg";
                      }}
                    />
                    <div className="text-truncate">
                      <div className="fw-bold text-white small text-truncate" title={metrics.topSellingGame.nombre}>
                        {metrics.topSellingGame.nombre}
                      </div>
                      <small className="text-info">{metrics.topSellingGame.total_vendidos} copias</small>
                    </div>
                  </div>
                ) : (
                  <h3 className="fs-6 text-muted">Sin ventas aún</h3>
                )}
              </div>
            </div>

            {/* Ticket Promedio */}
            <div className="kpi-card kpi-gold">
              <div className="kpi-icon-box">
                <i className="bi bi-ticket-perforated-fill"></i>
              </div>
              <div className="kpi-info">
                <h6>Ticket Promedio</h6>
                <h3>${(metrics.averageTicket || 0).toFixed(2)}</h3>
                <small className="text-warning">Por transacción</small>
              </div>
            </div>

            {/* Total Ingresos Acumulados */}
            <div className="kpi-card kpi-cyan">
              <div className="kpi-icon-box">
                <i className="bi bi-piggy-bank-fill"></i>
              </div>
              <div className="kpi-info">
                <h6>Ingresos Acumulados</h6>
                <h3>${(metrics.totalRevenue || 0).toFixed(2)}</h3>
                <small className="text-info">{metrics.totalSales || 0} ventas globales</small>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-purple" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-muted">Cargando datos administrativos...</p>
            </div>
          ) : (
            <>
              {/* VISTA 1: RÉSUMEN DE OPERACIÓN COMERCIAL */}
              {activeTab === "metrics" && (
                <div className="admin-glass-card">
                  <div className="card-title-header">
                    <h5>
                      <i className="bi bi-graph-up-arrow text-success"></i> Resumen Ejecutivo de Operaciones
                    </h5>
                  </div>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="p-3 rounded bg-dark border border-secondary">
                        <h6 className="text-info fw-bold">
                          <i className="bi bi-bar-chart-line-fill me-1"></i> Métricas del Período
                        </h6>
                        <ul className="list-unstyled mb-0 mt-2 small text-muted">
                          <li className="mb-2 d-flex justify-content-between">
                            <span>Facturación Mensual:</span>
                            <strong className="text-white">${(metrics.monthRevenue || 0).toFixed(2)}</strong>
                          </li>
                          <li className="mb-2 d-flex justify-content-between">
                            <span>Transacciones del Mes:</span>
                            <strong className="text-white">{metrics.monthSales || 0}</strong>
                          </li>
                          <li className="mb-2 d-flex justify-content-between">
                            <span>Valor Medio por Orden:</span>
                            <strong className="text-warning">${(metrics.averageTicket || 0).toFixed(2)}</strong>
                          </li>
                          <li className="d-flex justify-content-between">
                            <span>Ingresos Totales Históricos:</span>
                            <strong className="text-success">${(metrics.totalRevenue || 0).toFixed(2)}</strong>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="p-3 rounded bg-dark border border-secondary">
                        <h6 className="text-warning fw-bold">
                          <i className="bi bi-star-fill me-1"></i> Título Más Popular
                        </h6>
                        {metrics.topSellingGame ? (
                          <div className="d-flex align-items-center gap-3 mt-2">
                            <img
                              src={metrics.topSellingGame.imagen_url || "/nulls/placeholder-game.svg"}
                              alt={metrics.topSellingGame.nombre}
                              style={{ width: 54, height: 64, objectFit: "cover", borderRadius: 8 }}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "/nulls/placeholder-game.svg";
                              }}
                            />
                            <div>
                              <h6 className="fw-bold text-white mb-1">{metrics.topSellingGame.nombre}</h6>
                              <span className="badge bg-purple px-2 py-1">
                                {metrics.topSellingGame.total_vendidos} copias adquiridas
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted small mt-2">No se registran ventas para calcular el ranking.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA 2: GESTIÓN DE CATÁLOGO COMPLETA */}
              {activeTab === "catalog" && (
                <div className="row g-4">
                  {/* Formulario para Buscar e Incorporar Nuevos Juegos */}
                  <div className="col-lg-5">
                    <div className="admin-glass-card border-info">
                      <h5 className="text-info mb-3">
                        <i className="bi bi-plus-square-fill me-2"></i> Añadir Juegos al Catálogo
                      </h5>
                      <p className="small text-muted mb-3">
                        Busca en el catálogo global de IGDB para registrar nuevos títulos en la tienda y fijar su precio.
                      </p>
                      <GameAutocomplete
                        selectedGames={catalogSelectedGames}
                        onSelectGame={handleAddGameToCatalog}
                        onRemoveGame={() => setCatalogSelectedGames([])}
                      />
                    </div>
                  </div>

                  {/* Tabla de Juegos en Catálogo Comercial */}
                  <div className="col-lg-7">
                    <div className="admin-glass-card">
                      <div className="card-title-header">
                        <h5>
                          <i className="bi bi-controller text-warning"></i> Catálogo Activo ({catalog.length})
                        </h5>
                      </div>
                      <div className="table-responsive-custom">
                        <table className="table table-dark table-hover align-middle mb-0">
                          <thead>
                            <tr>
                              <th>Juego</th>
                              <th>Precio</th>
                              <th>Visibilidad</th>
                              <th>Acciones</th>
                            </tr>
                          </thead>
                          <tbody>
                            {catalog.length === 0 ? (
                              <tr>
                                <td colSpan="4" className="text-center text-muted py-4">
                                  No hay juegos en el catálogo. Utiliza el buscador para añadir títulos.
                                </td>
                              </tr>
                            ) : (
                              catalog.map((g) => (
                                <tr key={g.id_juego}>
                                  <td>
                                    <div className="d-flex align-items-center">
                                      <img
                                        src={g.imagen_url || "/nulls/placeholder-game.svg"}
                                        alt={g.nombre}
                                        style={{ width: 38, height: 46, objectFit: "cover", borderRadius: 6 }}
                                        className="me-2 flex-shrink-0"
                                        onError={(e) => {
                                          e.currentTarget.onerror = null;
                                          e.currentTarget.src = "/nulls/placeholder-game.svg";
                                        }}
                                      />
                                      <span className="fw-semibold text-truncate" style={{ maxWidth: 160 }} title={g.nombre}>
                                        {g.nombre}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <strong className="text-success">${parseFloat(g.precio_actual).toFixed(2)}</strong>
                                  </td>
                                  <td>
                                    <button
                                      type="button"
                                      className={`btn btn-sm ${g.activo ? "btn-outline-success" : "btn-outline-secondary"}`}
                                      onClick={() => handleToggleCatalogStatus(g)}
                                      title="Haz clic para cambiar visibilidad en la tienda"
                                    >
                                      {g.activo ? "🟢 Visible" : "🔴 Oculto"}
                                    </button>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => {
                                        setSelectedGameForPrice(g);
                                        setNewPrice(g.precio_actual);
                                      }}
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA 3: CAMPAÑAS DE DESCUENTO CON FORMATO DE FECHA LEGIBLE Y AUTOCOMPLETADO */}
              {activeTab === "discounts" && (
                <div className="row g-4">
                  {/* Formulario de Creación con Autocompletado */}
                  <div className="col-lg-5">
                    <div className="admin-glass-card border-info">
                      <h5 className="text-info mb-3">
                        <i className="bi bi-percent me-2"></i> Crear Campaña de Ofertas
                      </h5>
                      <form onSubmit={handleCreateDiscount}>
                        <div className="mb-3">
                          <label className="form-label small text-muted">Nombre de la Campaña</label>
                          <input
                            type="text"
                            className="form-control bg-dark text-white border-secondary"
                            value={discountForm.nombre}
                            onChange={(e) => setDiscountForm({ ...discountForm, nombre: e.target.value })}
                            placeholder="Ej. Ofertas de Verano, Black Friday"
                            required
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small text-muted">Descripción Opcional</label>
                          <textarea
                            className="form-control bg-dark text-white border-secondary"
                            rows="2"
                            value={discountForm.descripcion}
                            onChange={(e) => setDiscountForm({ ...discountForm, descripcion: e.target.value })}
                            placeholder="Detalles de la promoción..."
                          />
                        </div>

                        <div className="mb-3">
                          <label className="form-label small text-muted">Porcentaje de Descuento (%)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="1"
                            max="100"
                            className="form-control bg-dark text-white border-secondary"
                            value={discountForm.porcentaje}
                            onChange={(e) => setDiscountForm({ ...discountForm, porcentaje: e.target.value })}
                            placeholder="20"
                            required
                          />
                        </div>

                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <label className="form-label small text-muted">Fecha Inicio</label>
                            <input
                              type="date"
                              className="form-control bg-dark text-white border-secondary"
                              value={discountForm.fecha_inicio}
                              onChange={(e) => setDiscountForm({ ...discountForm, fecha_inicio: e.target.value })}
                              required
                            />
                          </div>
                          <div className="col-6">
                            <label className="form-label small text-muted">Fecha Fin</label>
                            <input
                              type="date"
                              className="form-control bg-dark text-white border-secondary"
                              value={discountForm.fecha_fin}
                              onChange={(e) => setDiscountForm({ ...discountForm, fecha_fin: e.target.value })}
                              required
                            />
                          </div>
                        </div>

                        {/* COMPONENTE DE AUTOCOMPLETADO INTELIGENTE SIN DESBORDAMIENTO */}
                        <div className="mb-4">
                          <GameAutocomplete
                            selectedGames={discountForm.selectedGames}
                            onSelectGame={handleSelectGameForDiscount}
                            onRemoveGame={handleRemoveGameFromDiscount}
                            catalogGames={catalog}
                          />
                        </div>

                        <button type="submit" className="btn btn-info w-100 fw-bold py-2">
                          <i className="bi bi-check-circle me-1"></i> Crear y Agendar Oferta
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Listado de Ofertas Registradas */}
                  <div className="col-lg-7">
                    <div className="admin-glass-card">
                      <div className="card-title-header">
                        <h5>
                          <i className="bi bi-tags-fill text-info"></i> Ofertas Registradas ({discounts.length})
                        </h5>
                      </div>
                      {discounts.length === 0 ? (
                        <p className="text-muted py-4 text-center">No hay campañas de descuento registradas.</p>
                      ) : (
                        <div className="d-flex flex-column gap-3">
                          {discounts.map((d) => {
                            const statusBadgeClass =
                              d.estado === "Activa"
                                ? "bg-success"
                                : d.estado === "Programada"
                                ? "bg-warning text-dark"
                                : "bg-secondary";

                            return (
                              <div key={d.id_descuento} className="card bg-dark bg-opacity-60 border-secondary p-3">
                                <div className="d-flex justify-content-between align-items-start">
                                  <div>
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                      <h6 className="fw-bold text-info m-0">
                                        {d.nombre} ({parseFloat(d.porcentaje)}% Off)
                                      </h6>
                                      <span className={`badge ${statusBadgeClass}`}>{d.estado || "Activa"}</span>
                                    </div>
                                    <p className="small text-muted mb-2">{d.descripcion || "Sin descripción"}</p>
                                    <div className="small mb-2">
                                      <span className="me-3 text-muted">
                                        📅 Vigencia: <strong>{formatDateReadable(d.fecha_inicio)}</strong> al{" "}
                                        <strong>{formatDateReadable(d.fecha_fin)}</strong>
                                      </span>
                                      <span className="text-muted">👤 Creador: {d.creador_nombre}</span>
                                    </div>
                                    {d.juegos_nombres && d.juegos_nombres.length > 0 && (
                                      <div className="small text-info bg-dark bg-opacity-40 p-2 rounded border border-secondary">
                                        <i className="bi bi-controller me-1"></i>{" "}
                                        <strong>Juegos incluidos:</strong> {d.juegos_nombres.join(", ")}
                                      </div>
                                    )}
                                  </div>
                                  <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleDeleteDiscount(d.id_descuento)}
                                    title="Eliminar campaña"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* VISTA 4: HISTORIAL GLOBAL DE VENTAS */}
              {activeTab === "purchases" && (
                <div className="admin-glass-card">
                  <div className="card-title-header">
                    <h5>
                      <i className="bi bi-receipt text-primary"></i> Historial Global de Ventas ({purchases.length})
                    </h5>
                  </div>
                  {purchases.length === 0 ? (
                    <p className="text-muted py-4 text-center">No hay transacciones registradas en la plataforma aún.</p>
                  ) : (
                    <div className="table-responsive-custom">
                      <table className="table table-dark table-hover align-middle mb-0">
                        <thead>
                          <tr>
                            <th>ID Compra</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Subtotal</th>
                            <th>Descuentos</th>
                            <th>Total Pagado</th>
                            <th>Items</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchases.map((p) => (
                            <tr key={p.id_compra}>
                              <td>
                                <strong>#{p.id_compra}</strong>
                              </td>
                              <td>
                                <div>{p.usuario?.nombre}</div>
                                <small className="text-muted">
                                  {p.usuario?.email} (@{p.usuario?.nickname})
                                </small>
                              </td>
                              <td>{new Date(p.fecha_compra).toLocaleString()}</td>
                              <td>${parseFloat(p.subtotal).toFixed(2)}</td>
                              <td className="text-success">-${parseFloat(p.descuento_total).toFixed(2)}</td>
                              <td className="fw-bold text-info">${parseFloat(p.total).toFixed(2)}</td>
                              <td>
                                <ul className="list-unstyled mb-0 small">
                                  {p.detalles?.map((d) => (
                                    <li key={d.id_detalle || d.id_juego}>
                                      • {d.nombre} (${parseFloat(d.precio_final).toFixed(2)})
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
