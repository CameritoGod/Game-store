import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/auth`;
const BACKEND_URL = API_BASE_URL.replace('/api', '');

const formatAvatarUrl = (avatar) => {
  if (!avatar) return '/nulls/null-user-img.png';
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  if (avatar.startsWith('/uploads')) return `${BACKEND_URL}${avatar}`;
  return avatar;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
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
});

const authService = {
  async login(email, password) {
    try {
      const res = await api.post(`${API_URL}/login`, { email, password });
      const userData = {
        ...res.data.user,
        avatar: formatAvatarUrl(res.data.user.avatar),
        token: res.data.token
      };
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(msg);
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
      const userData = {
        ...res.data.user,
        avatar: formatAvatarUrl(res.data.user.avatar),
        token: res.data.token
      };
      return userData;
    } catch (error) {
      const msg = error.response?.data?.message || "Error al registrarse";
      throw new Error(msg);
    }
  },

  async forgotPassword(email) {
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email }, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Error al solicitar código de recuperación";
      throw new Error(msg);
    }
  },

  async verifyCode(email, code) {
    try {
      const res = await axios.post(`${API_URL}/verify-code`, { email, code }, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Error al verificar código";
      throw new Error(msg);
    }
  },

  async resetPassword(email, password) {
    try {
      const res = await axios.post(`${API_URL}/reset-password`, { email, password }, {
        headers: { "Content-Type": "application/json" }
      });
      return res.data;
    } catch (error) {
      const msg = error.response?.data?.message || "Error al restablecer contraseña";
      throw new Error(msg);
    }
  }
};

export default authService;