import React from "react";
import Navbar from "../../../components/navbar/Navbar";
import { useAuth } from "../../../auth/useAuth";

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar user={user} />
      <div className="container mt-5 text-white pt-5">
        <div className="card bg-dark text-white border-secondary p-4">
          <h2>Panel de Administración <i className="bi bi-shield-lock-fill text-warning"></i></h2>
          <p className="lead text-secondary">
            Este módulo de administración está en desarrollo.
          </p>
          <div className="alert alert-info">
            Aquí podrás administrar juegos, descuentos y compras globales en una fase posterior.
          </div>
        </div>
      </div>
    </>
  );
}
