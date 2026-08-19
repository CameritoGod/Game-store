/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // 1. Agregamos el estado de carga inicializado en true
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde localStorage al iniciar la app
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
        
      }
      // 2. IMPORTANTE: Una vez que revisamos el localStorage, 
      // dejamos de cargar, sin importar si encontramos usuario o no.
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    // 3. Pasamos 'loading' en el value para que PrivateRoute pueda verlo
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}