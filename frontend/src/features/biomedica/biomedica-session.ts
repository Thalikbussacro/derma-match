import axios from 'axios';
import type { BiomedicaResponse } from '@derma-match/shared';
import { setBiomedicaToken } from './biomedicaToken';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export interface SessaoBiomedica {
  biomedica: BiomedicaResponse;
  accessToken: string;
}

let emVoo: Promise<SessaoBiomedica> | null = null;

// Refresh cru e deduplicado (evita rotação dupla sob StrictMode), via cookie próprio da biomédica.
export function refreshBiomedica(): Promise<SessaoBiomedica> {
  emVoo ??= executar().finally(() => {
    emVoo = null;
  });
  return emVoo;
}

async function executar(): Promise<SessaoBiomedica> {
  const res = await axios.post<SessaoBiomedica>(
    `${API_BASE}/biomedica/refresh`,
    {},
    { withCredentials: true },
  );
  setBiomedicaToken(res.data.accessToken);
  return res.data;
}
