import axios from "axios";

const configuredBaseURL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV
    ? (import.meta.env.VITE_BASE_LOCAL_URL || import.meta.env.VITE_BASE_LIVE_URL)
    : import.meta.env.VITE_BASE_LIVE_URL)
  || "http://127.0.0.1:8000/api/";

// Axios resolves relative paths against this URL, so keep exactly one trailing slash.
const baseURL = `${configuredBaseURL.replace(/\/+$/, "")}/`;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// attach tokens to reqs except public endpoints
api.interceptors.request.use(
  async (config) => {
   
    const publicEndpoints = ['users/login/', 'users/register/'];
    
    // if the current req is to a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      config.url?.includes(endpoint) || config.url?.endsWith(endpoint)
    );

    // add token if it's NOT a public endpoint
    if (!isPublicEndpoint) {
      const token = localStorage.getItem("accessToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const refreshToken = localStorage.getItem("refreshToken");
    const isRefreshRequest = originalRequest?.url?.includes("users/token/refresh/");
    const isLoginRequest = originalRequest?.url?.includes("users/login/");

    if (error.response?.status === 401 && refreshToken && !isRefreshRequest && !isLoginRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await api.post(
          "users/token/refresh/",
          { refresh: refreshToken }
        );

        const newAccessToken = response.data.access;
        localStorage.setItem("accessToken", newAccessToken);

        // Retry original req with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh fail?, clear tokens and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/home/login";
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
