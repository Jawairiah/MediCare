import axios from "axios";
import dayjs from "dayjs";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Simple interceptor to detect 401 and attempt refresh (optional)
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response && error.response.status === 401 && !original._retry) {
      original._retry = true;
      // Try refresh
      const refresh = localStorage.getItem("mc_refresh");
      if (!refresh) {
        return Promise.reject(error);
      }
      try {
        const r = await axios.post(`${api.defaults.baseURL}/api/auth/token/refresh/`, {
          refresh,
        });
        const newAccess = r.data.access;
        localStorage.setItem("mc_access", newAccess);
        api.defaults.headers.common["Authorization"] = `Bearer ${newAccess}`;
        original.headers["Authorization"] = `Bearer ${newAccess}`;
        return api(original);
      } catch (e) {
        // refresh failed
        localStorage.removeItem("mc_access");
        localStorage.removeItem("mc_refresh");
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
