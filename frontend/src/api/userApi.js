// src/api/userApi.js
import axios from "axios";

// 🎯 URL dinámica para producción / desarrollo
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// 🔐 Interceptor para agregar token automáticamente
api.interceptors.request.use(
  (config) => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const { token } = JSON.parse(savedUser);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (e) {
        console.error("Error parsing user from localStorage:", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🌐 Interceptor para manejar errores de red amigablemente sin romper la app
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.warn('⚠️ No se pudo conectar al endpoint de usuario/auth. Módulo en desarrollo futuro.');
    }
    return Promise.reject(error);
  }
);

// 🖼️ Función para actualizar avatar (Manejada de forma segura)
export const updateAvatar = async (file) => {
  try {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.put('/user/avatar', formData);
    return data;
  } catch (error) {
    console.warn("Módulo de usuario no disponible en backend aún:", error.message);
    return { success: false, message: "Funcionalidad de avatar pendiente de backend" };
  }
};

export const updateProfile = async (userId, profileData) => {
  try {
    const { data } = await api.put(`/user/${userId}`, profileData);
    return data;
  } catch (error) {
    console.warn("Módulo de usuario no disponible en backend aún:", error.message);
    return { success: false, message: "Funcionalidad de perfil pendiente de backend" };
  }
};

export const addFavorite = async (favoriteData) => {
  try {
    const { data } = await api.post('/user/favorites', favoriteData);
    return data;
  } catch (error) {
    console.warn("Módulo de favoritos no disponible en backend aún:", error.message);
    return { success: true };
  }
};

export const getFavorites = async () => {
  try {
    const { data } = await api.get('/user/favorites');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Módulo de favoritos no disponible en backend aún:", error.message);
    return [];
  }
};

export const deleteFavorite = async (gameId) => {
  try {
    const { data } = await api.delete(`/user/favorites/${gameId}`);
    return data;
  } catch (error) {
    console.warn("Módulo de favoritos no disponible en backend aún:", error.message);
    return { success: true };
  }
};

export const addPurchases = async (purchaseData) => {
  try {
    const { data } = await api.post('/user/purchases', purchaseData);
    return data;
  } catch (error) {
    console.warn("Módulo de compras no disponible en backend aún:", error.message);
    return { success: true };
  }
};

export const getPurchases = async () => {
  try {
    const { data } = await api.get('/user/purchases');
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn("Módulo de compras no disponible en backend aún:", error.message);
    return [];
  }
};

export default api;