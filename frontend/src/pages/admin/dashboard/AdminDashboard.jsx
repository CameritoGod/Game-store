import { useEffect, useState } from "react";
import Navbar from "../../../components/navbar/Navbar";
import { useAuth } from "../../../auth/useAuth";
import {
  getAdminMetrics,
  getAllPurchases,
  getCatalog,
  setCatalogPrice,
  getDiscounts,
  addDiscount,
  deleteDiscount
} from "../../../api/adminApi";

export default function AdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("metrics");

  // Estados de datos
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalSales: 0, totalUsers: 0, activeDiscounts: 0 });
  const [purchases, setPurchases] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [discounts, setDiscounts] = useState([]);

  // Estados de formularios
  const [selectedGameForPrice, setSelectedGameForPrice] = useState(null);
  const [newPrice, setNewPrice] = useState("");

  const [discountForm, setDiscountForm] = useState({
    nombre: "",
    descripcion: "",
    porcentaje: "",
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    selectedGames: []
  });

  const [loading, setLoading] = useState(true);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [m, p, c, d] = await Promise.all([
        getAdminMetrics().catch(() => ({ totalRevenue: 0, totalSales: 0, totalUsers: 0, activeDiscounts: 0 })),
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

  const handleUpdatePrice = async (e) => {
    e.preventDefault();
    if (!selectedGameForPrice || !newPrice) return;
    try {
      await setCatalogPrice({
        id_juego: selectedGameForPrice.id_juego,
        nombre: selectedGameForPrice.nombre,
        imagen_url: selectedGameForPrice.imagen_url,
        precio_actual: parseFloat(newPrice),
        activo: true
      });
      alert("✅ Precio de catálogo actualizado correctamente");
      setSelectedGameForPrice(null);
      setNewPrice("");
      loadAllData();
    } catch (error) {
      alert("❌ Error al actualizar precio: " + error.message);
    }
  };

  const handleCreateDiscount = async (e) => {
    e.preventDefault();
    if (!discountForm.nombre || !discountForm.porcentaje) return;
    try {
      await addDiscount({
        nombre: discountForm.nombre,
        descripcion: discountForm.descripcion,
        porcentaje: parseFloat(discountForm.porcentaje),
        fecha_inicio: discountForm.fecha_inicio,
        fecha_fin: discountForm.fecha_fin,
        gameIds: discountForm.selectedGames
      });
      alert("✅ Campaña de descuento creada con éxito");
      setDiscountForm({
        nombre: "",
        descripcion: "",
        porcentaje: "",
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        selectedGames: []
      });
      loadAllData();
    } catch (error) {
      alert("❌ Error al crear descuento: " + error.message);
    }
  };

  const handleDeleteDiscount = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta campaña de descuento?")) return;
    try {
      await deleteDiscount(id);
      alert("✅ Descuento eliminado");
      loadAllData();
    } catch (error) {
      alert("❌ Error al eliminar descuento: " + error.message);
    }
  };

  const toggleGameInDiscount = (id_juego) => {
    setDiscountForm(prev => {
      const exists = prev.selectedGames.includes(id_juego);
      return {
        ...prev,
        selectedGames: exists
          ? prev.selectedGames.filter(id => id !== id_juego)
          : [...prev.selectedGames, id_juego]
      };
    });
  };

  return (
    <>
      <Navbar user={user} />
      <div className="container-fluid py-4 text-white" style={{ marginTop: '60px' }}>
        
        {/* ENCABEZADO Y PESTAÑAS */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom border-secondary">
          <div>
            <h2>Panel de Administración <i className="bi bi-shield-lock-fill text-warning"></i></h2>
            <p className="text-muted mb-0">Gestión de Ventas, Catálogo Comercial y Campañas de Descuentos</p>
          </div>
          <button className="btn btn-outline-info btn-sm" onClick={loadAllData}>
            <i className="bi bi-arrow-clockwise me-1"></i> Actualizar Datos
          </button>
        </div>

        <ul className="nav nav-pills mb-4 gap-2 bg-dark p-2 rounded border border-secondary">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'metrics' ? 'active bg-primary' : 'text-white'}`}
              onClick={() => setActiveTab('metrics')}
            >
              <i className="bi bi-speedometer2 me-2"></i>Métricas Globales
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'purchases' ? 'active bg-primary' : 'text-white'}`}
              onClick={() => setActiveTab('purchases')}
            >
              <i className="bi bi-receipt me-2"></i>Historial de Ventas ({purchases.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'catalog' ? 'active bg-primary' : 'text-white'}`}
              onClick={() => setActiveTab('catalog')}
            >
              <i className="bi bi-tags-fill me-2"></i>Precios de Catálogo ({catalog.length})
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'discounts' ? 'active bg-primary' : 'text-white'}`}
              onClick={() => setActiveTab('discounts')}
            >
              <i className="bi bi-percent me-2"></i>Campañas de Descuento ({discounts.length})
            </button>
          </li>
        </ul>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted">Cargando información del panel...</p>
          </div>
        ) : (
          <>
            {/* PESTAÑA 1: MÉTRICAS */}
            {activeTab === 'metrics' && (
              <div className="row g-4">
                <div className="col-xl-3 col-md-6">
                  <div className="card bg-dark text-white border-primary shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <div className="rounded-circle bg-primary bg-opacity-20 p-3 me-3">
                        <i className="bi bi-cash-stack fs-1 text-primary"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Ingresos Totales</h6>
                        <h3 className="mb-0 fw-bold">${metrics.totalRevenue.toFixed(2)}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6">
                  <div className="card bg-dark text-white border-success shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <div className="rounded-circle bg-success bg-opacity-20 p-3 me-3">
                        <i className="bi bi-cart-check-fill fs-1 text-success"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Ventas Realizadas</h6>
                        <h3 className="mb-0 fw-bold">{metrics.totalSales}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6">
                  <div className="card bg-dark text-white border-warning shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <div className="rounded-circle bg-warning bg-opacity-20 p-3 me-3">
                        <i className="bi bi-people-fill fs-1 text-warning"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Usuarios Registrados</h6>
                        <h3 className="mb-0 fw-bold">{metrics.totalUsers}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-xl-3 col-md-6">
                  <div className="card bg-dark text-white border-info shadow-sm h-100">
                    <div className="card-body d-flex align-items-center">
                      <div className="rounded-circle bg-info bg-opacity-20 p-3 me-3">
                        <i className="bi bi-percent fs-1 text-info"></i>
                      </div>
                      <div>
                        <h6 className="text-muted mb-1">Descuentos Activos</h6>
                        <h3 className="mb-0 fw-bold">{metrics.activeDiscounts}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 2: VENTAS GLOBALES */}
            {activeTab === 'purchases' && (
              <div className="card bg-dark text-white border-secondary p-3">
                <h5 className="mb-3"><i className="bi bi-list-stars text-primary me-2"></i>Registro de Ventas Globales</h5>
                {purchases.length === 0 ? (
                  <p className="text-muted">No hay compras registradas en la plataforma aún.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-dark table-hover align-middle">
                      <thead>
                        <tr>
                          <th>ID Compra</th>
                          <th>Cliente</th>
                          <th>Fecha</th>
                          <th>Subtotal</th>
                          <th>Descuento Total</th>
                          <th>Total Paid</th>
                          <th>Items</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchases.map(p => (
                          <tr key={p.id_compra}>
                            <td><strong>#{p.id_compra}</strong></td>
                            <td>
                              <div>{p.usuario?.nombre}</div>
                              <small className="text-muted">{p.usuario?.email} (@{p.usuario?.nickname})</small>
                            </td>
                            <td>{new Date(p.fecha_compra).toLocaleString()}</td>
                            <td>${parseFloat(p.subtotal).toFixed(2)}</td>
                            <td className="text-success">-${parseFloat(p.descuento_total).toFixed(2)}</td>
                            <td className="fw-bold text-info">${parseFloat(p.total).toFixed(2)}</td>
                            <td>
                              <ul className="list-unstyled mb-0 small">
                                {p.detalles?.map(d => (
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

            {/* PESTAÑA 3: PRECIOS DE CATÁLOGO */}
            {activeTab === 'catalog' && (
              <div className="row g-4">
                <div className="col-lg-8">
                  <div className="card bg-dark text-white border-secondary p-3">
                    <h5 className="mb-3"><i className="bi bi-controller me-2 text-warning"></i>Juegos en Catálogo Comercial</h5>
                    <div className="table-responsive">
                      <table className="table table-dark table-hover align-middle">
                        <thead>
                          <tr>
                            <th>Juego</th>
                            <th>Precio Actual</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catalog.length === 0 ? (
                            <tr>
                              <td colSpan="4" className="text-center text-muted">No hay juegos configurados en el catálogo comercial.</td>
                            </tr>
                          ) : (
                            catalog.map(g => (
                              <tr key={g.id_juego}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    <img src={g.imagen_url || '/nulls/null-user-img.png'} alt={g.nombre} style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 6 }} className="me-2" />
                                    <span>{g.nombre}</span>
                                  </div>
                                </td>
                                <td><strong className="text-success">${parseFloat(g.precio_actual).toFixed(2)}</strong></td>
                                <td>
                                  <span className={`badge ${g.activo ? 'bg-success' : 'bg-danger'}`}>
                                    {g.activo ? 'Activo' : 'Inactivo'}
                                  </span>
                                </td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => {
                                      setSelectedGameForPrice(g);
                                      setNewPrice(g.precio_actual);
                                    }}
                                  >
                                    Editar Precio
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

                <div className="col-lg-4">
                  <div className="card bg-dark text-white border-warning p-3">
                    <h5><i className="bi bi-pencil-square me-2 text-warning"></i>Ajustar Precio Comercial</h5>
                    {selectedGameForPrice ? (
                      <form onSubmit={handleUpdatePrice} className="mt-3">
                        <div className="mb-3">
                          <label className="form-label">Juego Seleccionado</label>
                          <input type="text" className="form-control bg-secondary text-white border-0" value={selectedGameForPrice.nombre} disabled />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Nuevo Precio ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            className="form-control bg-dark text-white border-secondary"
                            value={newPrice}
                            onChange={(e) => setNewPrice(e.target.value)}
                            required
                          />
                        </div>
                        <button type="submit" className="btn btn-warning w-100">Guardar Precio</button>
                        <button type="button" className="btn btn-outline-secondary w-100 mt-2" onClick={() => setSelectedGameForPrice(null)}>Cancelar</button>
                      </form>
                    ) : (
                      <p className="text-muted mt-3">Selecciona "Editar Precio" en la tabla para modificar el precio de un juego.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* PESTAÑA 4: CAMPAÑAS DE DESCUENTO */}
            {activeTab === 'discounts' && (
              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="card bg-dark text-white border-secondary p-3">
                    <h5 className="mb-3"><i className="bi bi-percent text-info me-2"></i>Campañas de Descuento Existentes</h5>
                    {discounts.length === 0 ? (
                      <p className="text-muted">No hay campañas de descuento creadas.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {discounts.map(d => (
                          <div key={d.id_descuento} className="card bg-secondary bg-opacity-20 border-secondary p-3">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="fw-bold text-info mb-1">{d.nombre} ({parseFloat(d.porcentaje)}% Off)</h6>
                                <p className="small text-muted mb-2">{d.descripcion || 'Sin descripción'}</p>
                                <div className="small">
                                  <span className="me-3">📅 Vigencia: {d.fecha_inicio} al {d.fecha_fin}</span>
                                  <span>👤 Creador: {d.creador_nombre}</span>
                                </div>
                              </div>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteDiscount(d.id_descuento)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="col-lg-5">
                  <div className="card bg-dark text-white border-info p-3">
                    <h5><i className="bi bi-plus-circle me-2 text-info"></i>Crear Nueva Campaña</h5>
                    <form onSubmit={handleCreateDiscount} className="mt-3">
                      <div className="mb-3">
                        <label className="form-label">Nombre de la Campaña</label>
                        <input
                          type="text"
                          className="form-control bg-dark text-white border-secondary"
                          value={discountForm.nombre}
                          onChange={(e) => setDiscountForm({ ...discountForm, nombre: e.target.value })}
                          placeholder="Ej. Ofertas de Verano"
                          required
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                          className="form-control bg-dark text-white border-secondary"
                          rows="2"
                          value={discountForm.descripcion}
                          onChange={(e) => setDiscountForm({ ...discountForm, descripcion: e.target.value })}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Porcentaje de Descuento (%)</label>
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
                          <label className="form-label">Fecha Inicio</label>
                          <input
                            type="date"
                            className="form-control bg-dark text-white border-secondary"
                            value={discountForm.fecha_inicio}
                            onChange={(e) => setDiscountForm({ ...discountForm, fecha_inicio: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label">Fecha Fin</label>
                          <input
                            type="date"
                            className="form-control bg-dark text-white border-secondary"
                            value={discountForm.fecha_fin}
                            onChange={(e) => setDiscountForm({ ...discountForm, fecha_fin: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Asignar a Juegos de Catálogo</label>
                        <div className="bg-dark p-2 rounded border border-secondary" style={{ maxHeight: '150px', overflowY: 'auto' }}>
                          {catalog.length === 0 ? (
                            <small className="text-muted">No hay juegos en catálogo para asignar.</small>
                          ) : (
                            catalog.map(g => (
                              <div key={g.id_juego} className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id={`disc-game-${g.id_juego}`}
                                  checked={discountForm.selectedGames.includes(g.id_juego)}
                                  onChange={() => toggleGameInDiscount(g.id_juego)}
                                />
                                <label className="form-check-label text-white small" htmlFor={`disc-game-${g.id_juego}`}>
                                  {g.nombre}
                                </label>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      <button type="submit" className="btn btn-info w-100">Crear Descuento</button>
                    </form>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
