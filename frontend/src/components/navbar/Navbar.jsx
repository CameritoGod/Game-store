import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../context/CartContext";
import CartDropdown from "../CartDropdown/CartDropdown.jsx";
import "./nav.css";

export default function Navbar({ onToggleSidebar }) {
  //User y logout en todo momento
  const { user, logout } = useAuth();

  //Estados del carrito
  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef();

  //Cuenta de catidad de objetos
  //en el carrito
  const { count } = useCart();

  //Animacion
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (count > 0) {
      const startTimer = setTimeout(() => setAnimate(true), 0);
      const endTimer = setTimeout(() => setAnimate(false), 300);
      return () => {
        clearTimeout(startTimer);
        clearTimeout(endTimer);
      };
    }
  }, [count]);

  return (
    //El id home es para el enlace del footer
    <nav className="custom-navbar" id="home">
      {/* Left */}
      <div className="navbar-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <i className="bi bi-grid-3x3-gap-fill"></i>
        </button>
        <span className="navbar-brand">GameStore</span>
      </div>

      {/* Right */}
      <div className="navbar-right">
        {/* Cart */}
        <div className="cart-wrapper">
          <button className="cart-btn" onClick={() => setShowCart(!showCart)}>
            <i className="bi bi-cart4 text-white fs-5"></i>
            {count > 0 && (
              <span className={`cart-badge ${animate ? "badge-pop" : ""}`}>
                {count}
              </span>
            )}
          </button>
          {showCart && <CartDropdown />}
        </div>

        {/* User */}
        {user ? (
          <div className="user-wrapper" ref={userMenuRef}>
            <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
              <img src={user.avatar} alt="avatar" className="rounded-circle" />
               <i className="bi bi-caret-down-fill"></i>
            </button>

            {showUserMenu && (
              <ul className="user-dropdown">
                {user.role === "cliente" && (
                  <>
                    <li><Link to="/user">Perfil</Link></li>
                    <li><Link to="/user/history">Mis compras</Link></li>
                  </>
              )}
                <li className="divider"></li>
                <li className="logout" onClick={logout}>Cerrar sesión</li>
              </ul>
            )}
          </div>
        ) : (
          <Link to="/login" className="login-btn">
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
