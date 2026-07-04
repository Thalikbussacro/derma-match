import axios from 'axios';
import type { AdminResponse, BiomedicaAdmin, CriarBiomedicaInput } from '@derma-match/shared';
import { apiAdmin } from '../../lib/apiAdmin';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

interface SessaoAdmin {
  admin: AdminResponse;
  accessToken: string;
}

export const adminApi = {
  // Login/logout via axios cru (login estabelece o token; logout limpa o cookie).
  async login(email: string, senha: string): Promise<SessaoAdmin> {
    const res = await axios.post<SessaoAdmin>(
      `${API_BASE}/admin/login`,
      { email, senha },
      { withCredentials: true },
    );
    return res.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_BASE}/admin/logout`, {}, { withCredentials: true });
  },

  async biomedicas(): Promise<BiomedicaAdmin[]> {
    const res = await apiAdmin.get<BiomedicaAdmin[]>('/admin/biomedicas');
    return res.data;
  },

  async criarBiomedica(input: CriarBiomedicaInput): Promise<BiomedicaAdmin> {
    const res = await apiAdmin.post<BiomedicaAdmin>('/admin/biomedicas', input);
    return res.data;
  },

  async definirAtiva(id: number, ativa: boolean): Promise<BiomedicaAdmin> {
    const res = await apiAdmin.patch<BiomedicaAdmin>(`/admin/biomedicas/${id}/ativa`, { ativa });
    return res.data;
  },
};
