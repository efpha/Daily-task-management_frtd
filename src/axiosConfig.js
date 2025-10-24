// Interceptor to attach tokens to all axios requests
import axios from "axios";

const api = axios.create({
  baseURL: "https://daily-task-management-backend.onrender.com/api/",
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
