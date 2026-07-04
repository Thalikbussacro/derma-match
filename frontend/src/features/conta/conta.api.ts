import { api } from '../../lib/api';
import type { Usuario } from '../auth/auth.schemas';

export const contaApi = {
  async obterPerfil(): Promise<Usuario> {
    const res = await api.get<Usuario>('/me');
    return res.data;
  },

  async atualizar(input: {
    nome?: string;
    senhaAtual?: string;
    novaSenha?: string;
  }): Promise<Usuario> {
    const res = await api.patch<Usuario>('/me', input);
    return res.data;
  },

  async excluir(): Promise<void> {
    await api.delete('/me');
  },

  async exportarDados(): Promise<unknown> {
    const res = await api.get<unknown>('/me/dados');
    return res.data;
  },

  async definirMeta(meta: string | null): Promise<Usuario> {
    const res = await api.put<Usuario>('/me/meta', { meta });
    return res.data;
  },
};
