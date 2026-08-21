// src/services/authService.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/auth`;

// Instancia de axios configurada
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const { token } = JSON.parse(savedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error("Error parsing user:", e);
    }
  }
  return config;
});

const authService = {
  async login(email, password) {
    try {
      const res = await api.post(`${API_URL}/login`, {
        email,
        password
      });
      return res.data;
    } catch (error) {
      console.warn("Autenticación pendiente de backend:", error.message);
      throw error;
    }
  },

  async register(nombre, nickname, email, password, rol) {
    try {
      const res = await api.post(`${API_URL}/register`, {
        nombre,
        nickname,
        email,
        password,
        rol: rol || "cliente"
      });
      return {
        ...res.data,
        avatar: res.data.avatar || "/nulls/null-user-img.png"
      };
    } catch (error) {
      console.warn("Registro pendiente de backend:", error.message);
      throw error;
    }
  },

  // ======================
  // OLVIDÉ CONTRASEÑA
  // ======================

  async forgotPassword(email) {
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, {
        email
      }, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (error) {
      console.warn("Restablecer contraseña pendiente de backend:", error.message);
      throw error;
    }
  },

  async verifyCode(email, code) {
    try {
      const res = await axios.post(`${API_URL}/verify-code`, {
        email,
        code
      }, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (error) {
      console.warn("Verificar código pendiente de backend:", error.message);
      throw error;
    }
  },

  async resetPassword(email, password) {
    try {
      const res = await axios.post(`${API_URL}/reset-password`, {
        email,
        password
      }, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (error) {
      console.warn("Reset contraseña pendiente de backend:", error.message);
      throw error;
    }
  }
};

export default authService;