import { api } from '../../lib/api';

export type Etapa = 'LIMPEZA' | 'TONIFICACAO' | 'HIDRATACAO' | 'PROTECAO_SOLAR' | 'TRATAMENTO';

export const ETAPA_LABEL: Record<Etapa, string> = {
  LIMPEZA: 'Limpeza',
  TONIFICACAO: 'Tonificação',
  HIDRATACAO: 'Hidratação',
  PROTECAO_SOLAR: 'Proteção solar',
  TRATAMENTO: 'Tratamento',
};

export interface ItemRotina {
  id: number;
  etapa: Etapa;
  descricao: string;
  ordem: number;
}

export interface Rotina {
  id: number;
  tipoPele: { id: number; nome: string };
  descricao: string;
  itens: ItemRotina[];
}

export const rotinaApi = {
  async obter(): Promise<Rotina> {
    const res = await api.get<Rotina>('/rotina');
    return res.data;
  },
};
