import type { PainelUpgradeResponse, UsuarioResponse } from '@derma-match/shared';
import { api } from '../../lib/api';

export type { PainelUpgradeResponse as PainelUpgrade };

export const premiumApi = {
  async obterPainel(): Promise<PainelUpgradeResponse> {
    const res = await api.get<PainelUpgradeResponse>('/premium/painel-upgrade');
    return res.data;
  },

  // Assinatura mockada (sem cobrança). Retorna o usuário com o plano atualizado.
  async assinar(): Promise<UsuarioResponse> {
    const res = await api.post<UsuarioResponse>('/assinatura');
    return res.data;
  },

  async cancelar(): Promise<UsuarioResponse> {
    const res = await api.delete<UsuarioResponse>('/assinatura');
    return res.data;
  },
};
