import axios from 'axios';
import { TokenResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:7007/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh automatically
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('auth/refresh-token') || originalRequest.url?.includes('auth/login')) {
        // If the refresh token request itself fails or login fails, clear tokens and redirect
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token || !refreshToken) {
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          token,
          refreshToken,
        });

        // The response will wrap the data in a GenericResponse standard shape
        // In GenericResponse, the payload is in the 'data' property
        const genericResponse = response.data;
        if (genericResponse.succeeded && genericResponse.data) {
          const tokenData: TokenResponse = genericResponse.data;
          localStorage.setItem('token', tokenData.token);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
          localStorage.setItem('user', JSON.stringify(tokenData));

          axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${tokenData.token}`;
          originalRequest.headers.Authorization = `Bearer ${tokenData.token}`;

          processQueue(null, tokenData.token);
          isRefreshing = false;

          return axiosInstance(originalRequest);
        } else {
          throw new Error('Refresh token failed');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
