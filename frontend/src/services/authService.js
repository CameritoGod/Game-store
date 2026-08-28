import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/auth`;

/**
 * Normaliza la URL del avatar del usuario asignando un fallback de DiceBear si no existe.
 */
const formatAvatarUrl = (avatar) => {
  if (!avatar) return 'https://api.dicebear.com/9.x/bottts/svg?seed=Felix';
  return avatar;
};

// Instancia configurada de Axios para peticiones de autenticación
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adjuntar automáticamente el token JWT en las cabeceras
api.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem("user");
  if (savedUser) {
    try {
      const { token } = JSON.parse(savedUser);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Si el formato en storage está corrupto, se omite el token
    }
  }
  return config;
});

const authService = {
  /**
   * Inicia sesión con credenciales de usuario y formatea la respuesta con token.
   */
  async login(email, password) {
    try {
      const res = await api.post(`${API_URL}/login`, { email, password });
      return {
        ...res.data.user,
        avatar: formatAvatarUrl(res.data.user.avatar || res.data.user.avatar_url),
        avatar_url: formatAvatarUrl(res.data.user.avatar_url || res.data.user.avatar),
        token: res.data.token
      };
    } catch (error) {
      const msg = error.response?.data?.message || "Error al iniciar sesión";
      throw new Error(msg);
    }
  },

  /**
   * Registra una nueva cuenta de usuario en la plataforma.
   */
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
        ...res.data.user,
        avatar: formatAvatarUrl(res.data.user.avatar || res.data.user.avatar_url),
        avatar_url: formatAvatarUrl(res.data.user.avatar_url || res.data.user.avatar),
        token: res.data.token
      };
    } catch (error) {
      const msg = error.response?.data?.message || "Error al registrarse";
      throw new Error(msg);
    }
  },

  /**
   * Solicita el envío de un código OTP de recuperación al correo especificado.
   */
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

  /**
   * Verifica la validez y vigencia del código OTP de 6 dígitos.
   */
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

  /**
   * Restablece la contraseña del usuario validando el código de seguridad.
   */
  async resetPassword(email, code, password) {
    try {
      const res = await axios.post(`${API_URL}/reset-password`, { email, code, password }, {
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