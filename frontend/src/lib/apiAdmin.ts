import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { refreshAdmin } from '../features/admin/admin-session';
import { getAdminToken, setAdminToken } from '../features/admin/adminToken';

// Cliente HTTP da área do admin (token e refresh próprios).
export const apiAdmin = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});

apiAdmin.interceptors.request.use((config) => {
  const token = getAdminToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiAdmin.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ codigo?: string }>) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const expirou =
      error.response?.status === 401 && error.response.data?.codigo === 'TOKEN_EXPIRADO';

    if (expirou && original && !original._retry) {
      original._retry = true;
      try {
        const { accessToken } = await refreshAdmin();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return await apiAdmin(original);
      } catch (erroRefresh) {
        setAdminToken(null);
        window.dispatchEvent(new Event('admin:logout'));
        throw erroRefresh;
      }
    }
    throw error;
  },
);
