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

  useEffect(() => {
    getPurchases().then(setPurchases);
  }, []);

  const filterByDate = (date) => {
    const purchaseDate = new Date(date);
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

      <div className="user-history container-fluid">
        <div className="ud-card purchase-history">

          {/* HEADER */}
          <div className="ph-header">
            <div className="ph-title">
              <h5 className="ud-section-title">
                <i className="bi bi-receipt"></i> Historial de Pagos
              </h5>
              <p>Consulta y filtra todas tus compras realizadas</p>
            </div>

            <div className="ph-filters">
              <div className="ph-chips">
                <button onClick={() => setFilter("all")}>Todo</button>
                <button onClick={() => setFilter("7days")}>7 días</button>
                <button onClick={() => setFilter("month")}>Mes</button>
                <button onClick={() => setFilter("year")}>Año</button>
              </div>

              <div className="ph-dates">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
                <span>→</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* LISTA */}
          <div className="ph-list">
            {purchases
              .filter(p => filterByDate(p.fecha_compra))
              .map(p => (
                <div key={p.id_compra + p.id_juego} className="ph-item">
                  <img src={p.imagen_url} alt={p.nombre} />

                  <div className="ph-info">
                    <h6>{p.nombre}</h6>
                    <span>
                      {new Date(p.fecha_compra).toLocaleDateString()} · Compra #{p.id_compra}
                    </span>
                  </div>

                  <div className="ph-price">
                    ${p.precio}
                  </div>
                </div>
              ))}
          </div>

        </div>
      </div>
    </>
  );
}
