import axios from "axios";
const  base_live_URL=import.meta.VITE_BASE_LIVE_URL
const  base_local_URL= import.meta.VITE_BASE_LOCAL_URL

const api = axios.create({
  baseURL: base_live_URL,
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

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post(
          `${base_live_URL}users/token/refresh/`,
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