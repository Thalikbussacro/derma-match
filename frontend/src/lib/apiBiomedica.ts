import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { refreshBiomedica } from '../features/biomedica/biomedica-session';
import { getBiomedicaToken, setBiomedicaToken } from '../features/biomedica/biomedicaToken';

// Cliente HTTP da área da biomédica (token e refresh próprios).
export const apiBiomedica = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});

apiBiomedica.interceptors.request.use((config) => {
  const token = getBiomedicaToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiBiomedica.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ codigo?: string }>) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const expirou =
      error.response?.status === 401 && error.response.data?.codigo === 'TOKEN_EXPIRADO';

    if (expirou && original && !original._retry) {
      original._retry = true;
      try {
        const { accessToken } = await refreshBiomedica();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return await apiBiomedica(original);
      } catch (erroRefresh) {
        setBiomedicaToken(null);
        window.dispatchEvent(new Event('biomedica:logout'));
        throw erroRefresh;
      }
    }
    throw error;
  },
);
