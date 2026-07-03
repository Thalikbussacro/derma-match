import { api } from '../../lib/api';

export interface PainelUpgrade {
  titulo: string;
  descricao: string;
  beneficios: string[];
  aviso: string;
}

export const premiumApi = {
  async obterPainel(): Promise<PainelUpgrade> {
    const res = await api.get<PainelUpgrade>('/premium/painel-upgrade');
    return res.data;
  },
};
