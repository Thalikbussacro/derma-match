import axios from 'axios';
import type { Usuario } from './auth.schemas';
import { setAccessToken } from './tokenStore';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export interface Sessao {
  usuario: Usuario;
  accessToken: string;
}

let refreshEmVoo: Promise<Sessao> | null = null;

// Refresh "cru" (axios direto, sem o interceptor). Deduplica chamadas concorrentes — o boot em
// StrictMode e 401s em paralelo compartilham um único refresh, evitando rotação dupla do token
// (que o backend trataria como reuso e revogaria a família).
export function refreshSessao(): Promise<Sessao> {
  refreshEmVoo ??= executarRefresh().finally(() => {
    refreshEmVoo = null;
  });
  return refreshEmVoo;
}

async function executarRefresh(): Promise<Sessao> {
  const res = await axios.post<Sessao>(`${API_BASE}/auth/refresh`, {}, { withCredentials: true });
  setAccessToken(res.data.accessToken);
  return res.data;
}
