import { useEffect, useState } from "react";
import Navbar from "../../../components/navbar/Navbar";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { getPurchases } from "../../../api/userApi";
import { useAuth } from "../../../auth/useAuth";
import "./PurchaseHistory.css";

export default function PurchaseHistory() {
  const { user } = useAuth();

  const [purchases, setPurchases] = useState([]);
  const [filter, setFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Cargar historial de compras del usuario autenticado
  useEffect(() => {
    getPurchases().then(setPurchases).catch(() => setPurchases([]));
  }, []);

  const filterByDate = (dateStr) => {
    if (!dateStr) return true;
    const purchaseDate = new Date(dateStr);
    const now = new Date();

    if (fromDate && purchaseDate < new Date(fromDate)) return false;
    if (toDate && purchaseDate > new Date(toDate)) return false;

    if (filter === "7days") {
      return (now - purchaseDate) / 86400000 <= 7;
    }
    if (filter === "month") {
      return (
        now.getMonth() === purchaseDate.getMonth() &&
        now.getFullYear() === purchaseDate.getFullYear()
      );
    }
    if (filter === "year") {
      return now.getFullYear() === purchaseDate.getFullYear();
    }

    return true;
  };

  if (!user) return null;

  return (
    <>
      <Navbar
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="user-history container-fluid py-4">
        <div className="ud-card purchase-history p-4">

          {/* HEADER */}
          <div className="ph-header mb-4">
            <div className="ph-title">
              <h5 className="ud-section-title text-white">
                <i className="bi bi-receipt me-2 text-primary"></i> Historial de Compras
              </h5>
              <p className="text-muted">Consulta y filtra todas tus transacciones realizadas</p>
            </div>

            <div className="ph-filters d-flex gap-3 align-items-center flex-wrap">
              <div className="ph-chips btn-group">
                <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter("all")}>Todo</button>
                <button className={`btn btn-sm ${filter === '7days' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter("7days")}>7 días</button>
                <button className={`btn btn-sm ${filter === 'month' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter("month")}>Este mes</button>
                <button className={`btn btn-sm ${filter === 'year' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setFilter("year")}>Este año</button>
              </div>

              <div className="ph-dates d-flex align-items-center gap-2">
                <input
                  type="date"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span className="text-muted">→</span>
                <input
                  type="date"
                  className="form-control form-control-sm bg-dark text-white border-secondary"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* LISTA */}
          <div className="ph-list">
            {purchases.filter(p => filterByDate(p.fecha_compra)).length === 0 ? (
              <p className="text-center text-muted py-5">No tienes compras registradas en este período.</p>
            ) : (
              purchases
                .filter(p => filterByDate(p.fecha_compra))
                .map(p => (
                  <div key={p.id_compra} className="card bg-dark text-white border-secondary mb-3 shadow-sm">
                    <div className="card-header border-secondary d-flex justify-content-between align-items-center bg-secondary bg-opacity-10">
                      <div>
                        <strong>Orden #{p.id_compra}</strong>
                        <span className="text-muted ms-3">
                          <i className="bi bi-calendar-event me-1"></i>
                          {new Date(p.fecha_compra).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-end">
                        <span className="badge bg-success fs-6">Total: ${parseFloat(p.total).toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="card-body">
                      {p.detalles && p.detalles.map(d => (
                        <div key={d.id_detalle || d.id_juego} className="d-flex align-items-center justify-content-between py-2 border-bottom border-secondary">
                          <div className="d-flex align-items-center">
                            <img 
                              src={d.imagen_url || '/nulls/null-user-img.png'} 
                              alt={d.nombre} 
                              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }}
                              className="me-3"
                            />
                            <div>
                              <h6 className="mb-0 text-white">{d.nombre}</h6>
                              {parseFloat(d.descuento_aplicado) > 0 && (
                                <small className="text-success me-2">-{d.descuento_aplicado}% desc.</small>
                              )}
                              <small className="text-muted">Precio reg.: ${parseFloat(d.precio_unitario).toFixed(2)}</small>
                            </div>
                          </div>
                          <div className="fw-bold text-info">
                            ${parseFloat(d.precio_final).toFixed(2)}
                          </div>
                        </div>
                      ))}

                      <div className="d-flex justify-content-end gap-3 mt-3 pt-2 text-muted small">
                        <div>Subtotal: ${parseFloat(p.subtotal).toFixed(2)}</div>
                        <div>Descuento: -${parseFloat(p.descuento_total).toFixed(2)}</div>
                        <div className="fw-bold text-white">Total Pagado: ${parseFloat(p.total).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

        </div>
      </div>
    </>
  );
}
