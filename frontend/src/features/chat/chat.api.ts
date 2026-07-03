import type { ConversaResponse, MensagemResponse } from '@derma-match/shared';
import { api } from '../../lib/api';

export const chatApi = {
  async obterConversa(): Promise<ConversaResponse | null> {
    const res = await api.get<{ conversa: ConversaResponse | null }>('/conversa');
    return res.data.conversa;
  },

  async listarMensagens(): Promise<MensagemResponse[]> {
    const res = await api.get<{ mensagens: MensagemResponse[] }>('/conversa/mensagens');
    return res.data.mensagens;
  },

  async enviar(conteudo: string, foto: File | null): Promise<MensagemResponse> {
    const form = new FormData();
    form.append('conteudo', conteudo);
    if (foto) {
      form.append('foto', foto);
    }
    const res = await api.post<MensagemResponse>('/conversa/mensagens', form);
    return res.data;
  },
};
