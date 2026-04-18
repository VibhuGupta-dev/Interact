import axios from "axios";
const backendurl = import.meta.env.VITE_BACKEND_URI;

const api = axios.create({
  baseURL: backendurl,
  withCredentials: true,
});

// attach token from localStorage if present (Google OAuth fallback)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;