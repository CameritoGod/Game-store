import ReactDOM from 'react-dom/client';
import App from './App';

// 🔴 Bootstrap PRIMERO
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";

// ✅ Luego tus estilos
import './index.css';

import { AuthProvider } from './auth/AuthContext';
import { CartProvider } from "./context/CartContext";

ReactDOM.createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>
);