import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const BACKEND_URL = API_BASE_URL.replace('/api', '');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

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

export const formatAvatarUrl = (avatar) => {
  if (!avatar) return '/nulls/null-user-img.png';
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) return avatar;
  if (avatar.startsWith('/uploads')) return `${BACKEND_URL}${avatar}`;
  return avatar;
};

export const updateAvatar = async (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  const { data } = await api.put('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return {
    ...data,
    avatar_url: formatAvatarUrl(data.avatar_url)
  };
};

export const updateProfile = async (userId, profileData) => {
  const { data } = await api.put(`/user/profile`, profileData);
  return {
    ...data,
    user: data.user ? { ...data.user, avatar: formatAvatarUrl(data.user.avatar) } : null
  };
};

export const addFavorite = async (gameData) => {
  const { data } = await api.post('/user/favorites', gameData);
  return data;
};

export const getFavorites = async () => {
  const { data } = await api.get('/user/favorites');
  return Array.isArray(data) ? data : [];
};

export const deleteFavorite = async (gameId) => {
  const { data } = await api.delete(`/user/favorites/${gameId}`);
  return data;
};

export const checkoutCart = async (items) => {
  const formattedItems = Array.isArray(items) ? items : (items?.items || []);
  const { data } = await api.post('/user/purchases', { items: formattedItems });
  return data;
};

export const addPurchases = async (purchaseData) => {
  const items = Array.isArray(purchaseData) ? purchaseData : (purchaseData?.items || []);
  return await checkoutCart(items);
};

export const getPurchases = async () => {
  const { data } = await api.get('/user/purchases');
  return Array.isArray(data) ? data : [];
};

export const getLibrary = async () => {
  const { data } = await api.get('/user/library');
  return Array.isArray(data) ? data : [];
};

export default api;