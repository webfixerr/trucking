import axios from 'axios';
import { getAuthStore } from '@/stores/auth';

const api = axios.create({
  baseURL: 'http://localhost:8081', // Replace with your API URL
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const { token } = getAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      const { logout } = getAuthStore.getState();
      logout();
    }
    return Promise.reject(error);
  }
);

export default api;