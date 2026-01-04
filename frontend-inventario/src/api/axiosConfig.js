import axios from "axios";

const BASE_URL = "https://swci-backend.onrender.com" || "http://localhost:8080";

const axiosInstance = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const storage = localStorage.getItem("global-storage");
    let token = null;

    if (storage) {
      try {
        const parsedStorage = JSON.parse(storage);
        if (parsedStorage.state && parsedStorage.state.token) {
          token = parsedStorage.state.token;
        }
      } catch (e) {
        console.error("Error al parsear el storage de Zustand", e);
      }
    }
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Token expirado o inválido. Cerrando sesión...");
      localStorage.clear();
      window.location.href = "/"; 
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
