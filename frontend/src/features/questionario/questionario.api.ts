import { api } from '../../lib/api';
import type { EstadoQuestionario, Pergunta, ResultadoTipoPele } from './questionario.types';

export const questionarioApi = {
  async obterEstado(): Promise<EstadoQuestionario> {
    const res = await api.get<EstadoQuestionario>('/questionario/estado');
    return res.data;
  },

  async obterProxima(): Promise<Pergunta | null> {
    const res = await api.get<{ pergunta: Pergunta | null }>('/questionario/proxima');
    return res.data.pergunta;
  },

  async responder(perguntaId: number, opcaoId: number): Promise<void> {
    await api.post('/questionario/responder', { perguntaId, opcaoId });
  },

  async finalizar(): Promise<ResultadoTipoPele> {
    const res = await api.post<ResultadoTipoPele>('/questionario/finalizar');
    return res.data;
  },

  async refazer(): Promise<void> {
    await api.post('/questionario/refazer');
  },
};
