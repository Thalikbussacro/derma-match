import axios from 'axios';
import type { AdminResponse } from '@derma-match/shared';
import { setAdminToken } from './adminToken';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export interface SessaoAdmin {
  admin: AdminResponse;
  accessToken: string;
}

let emVoo: Promise<SessaoAdmin> | null = null;

// Refresh cru e deduplicado (evita rotação dupla sob StrictMode), via cookie próprio do admin.
export function refreshAdmin(): Promise<SessaoAdmin> {
  emVoo ??= executar().finally(() => {
    emVoo = null;
  });
  return emVoo;
}

async function executar(): Promise<SessaoAdmin> {
  const res = await axios.post<SessaoAdmin>(
    `${API_BASE}/admin/refresh`,
    {},
    { withCredentials: true },
  );
  setAdminToken(res.data.accessToken);
  return res.data;
}
