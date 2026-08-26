import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { useCart } from "../../context/CartContext";
import CartDropdown from "../CartDropdown/CartDropdown.jsx";
import { getAvatarUrl, generateSVGPlaceholder } from "../../utils/avatarUtils";
import "./nav.css";

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();

  const [showCart, setShowCart] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef();

  const { count } = useCart();
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
          {showCart && <CartDropdown onClose={() => setShowCart(false)} />}
        </div>

        {/* User */}
        {user ? (
          <div className="user-wrapper" ref={userMenuRef}>
            <button className="user-btn" onClick={() => setShowUserMenu(!showUserMenu)}>
              <img 
                src={getAvatarUrl(user)} 
                alt="avatar" 
                className="rounded-circle"
                style={{ width: 36, height: 36, objectFit: 'cover' }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = generateSVGPlaceholder(user?.nickname || user?.nombre || 'U');
                }}
              />
              <i className="bi bi-caret-down-fill ms-1"></i>
            </button>

            {showUserMenu && (
              <ul className="user-dropdown">
                {user.role === "cliente" || user.rol === "cliente" ? (
                  <>
                    <li><Link to="/user">Perfil</Link></li>
                    <li><Link to="/user/history">Mis compras</Link></li>
                  </>
                ) : (
                  <li><Link to="/admin">Panel Admin</Link></li>
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
