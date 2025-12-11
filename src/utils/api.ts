import axios, { AxiosInstance } from 'axios';
import type { SiteType } from '../types';

const API_BASE_URLS: Record<SiteType, string> = {
  gpg: 'https://gpg-backend.zeabur.app',
  valesco: 'https://backend.valescooil.com',
};

export const createApiClient = (site: SiteType, token?: string): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URLS[site],
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Don't redirect on 401 during login attempts
      if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
        // Clear auth on 401 (but not during login)
        localStorage.removeItem('auth');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
};

export const clearCache = () => {
  // Clear all localStorage except auth
  const auth = localStorage.getItem('auth');
  localStorage.clear();
  if (auth) {
    localStorage.setItem('auth', auth);
  }
  // Clear sessionStorage
  sessionStorage.clear();
};

