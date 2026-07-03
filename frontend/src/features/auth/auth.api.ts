import { api } from '../../lib/api';
import type { Usuario } from './auth.schemas';
import type { Sessao } from './session';

export const authApi = {
  async cadastrar(data: {
    nome: string;
    email: string;
    senha: string;
    aceiteLgpd: boolean;
  }): Promise<Usuario> {
    const res = await api.post<Usuario>('/auth/cadastro', data);
    return res.data;
  },

  async login(data: { email: string; senha: string }): Promise<Sessao> {
    const res = await api.post<Sessao>('/auth/login', data);
    return res.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async recuperarSenha(email: string): Promise<void> {
    await api.post('/auth/recuperar-senha', { email });
  },

  async redefinirSenha(token: string, novaSenha: string): Promise<void> {
    await api.post('/auth/redefinir-senha', { token, novaSenha });
  },
};
