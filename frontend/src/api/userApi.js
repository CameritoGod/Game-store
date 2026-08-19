// src/api/userApi.js
import axios from "axios";

// 🎯 URL dinámica para producción
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

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

// 🌐 Interceptor para manejar errores de red amigablemente
api.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
      console.error('❌ No se pudo conectar al servidor. Verifica tu conexión o que el backend esté activo.');
    }
    return Promise.reject(error);
  }
);

// 🖼️ Función para actualizar avatar
export const updateAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);

  // ⚠️ NO establecer Content-Type manualmente: axios lo hace con el boundary correcto
  const { data } = await api.put('/user/avatar', formData);
  return data;
};

export const updateProfile = async (userId, profileData) => {
  const { data } = await api.put(`/user/${userId}`, profileData);
  return data;
};

export const addFavorite = async (favoriteData) => {
  const { data } = await api.post('/user/favorites', favoriteData);
  return data;
};

export const getFavorites = async () => {
  const { data } = await api.get('/user/favorites');
  return data;
};

export const deleteFavorite = async (gameId) => {
  const { data } = await api.delete(`/user/favorites/${gameId}`);
  return data;
};

export const addPurchases = async (purchaseData) => {
  const { data } = await api.post('/user/purchases', purchaseData);
  return data;
};

export const getPurchases = async () => {
  const { data } = await api.get('/user/purchases');
  return data;
};

export default api;