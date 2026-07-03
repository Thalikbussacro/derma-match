import type { Etapa, ItemRotinaResponse, RotinaResponse } from '@derma-match/shared';
import { api } from '../../lib/api';

export type { Etapa, ItemRotinaResponse as ItemRotina, RotinaResponse as Rotina };

export const ETAPA_LABEL: Record<Etapa, string> = {
  LIMPEZA: 'Limpeza',
  TONIFICACAO: 'Tonificação',
  HIDRATACAO: 'Hidratação',
  PROTECAO_SOLAR: 'Proteção solar',
  TRATAMENTO: 'Tratamento',
};

export const rotinaApi = {
  async obter(): Promise<RotinaResponse> {
    const res = await api.get<RotinaResponse>('/rotina');
    return res.data;
  },
};
