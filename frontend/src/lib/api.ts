import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { refreshSessao } from '../features/auth/session';
import { getAccessToken, setAccessToken } from '../features/auth/tokenStore';

// Cliente HTTP único. withCredentials envia o cookie httpOnly de refresh.
// Sem Content-Type fixo: o axios define JSON para objetos e multipart para FormData (fotos).
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  withCredentials: true,
});

// Injeta o access token (em memória) em cada requisição.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ codigo?: string }>) => {
    const original = error.config as
      (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
    const expirou =
      error.response?.status === 401 && error.response.data?.codigo === 'TOKEN_EXPIRADO';

    if (expirou && original && !original._retry) {
      original._retry = true;
      try {
        // refreshSessao é deduplicado: múltiplos 401 concorrentes fazem um único refresh.
        const { accessToken } = await refreshSessao();
        original.headers.Authorization = `Bearer ${accessToken}`;
        return await api(original);
      } catch (erroRefresh) {
        // Refresh falhou: sessão perdida. Limpa e avisa o AuthProvider.
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        throw erroRefresh;
      }
    }

    throw error;
  },
);
