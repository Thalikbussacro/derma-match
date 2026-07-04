import axios from 'axios';
import type {
  BiomedicaResponse,
  ContextoClinicoResponse,
  ConversaBiomedicaResponse,
  MensagemResponse,
  RegistroDiarioResponse,
  RotinaEdicaoResponse,
  SalvarRotinaInput,
} from '@derma-match/shared';
import { apiBiomedica } from '../../lib/apiBiomedica';

const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

interface SessaoBiomedica {
  biomedica: BiomedicaResponse;
  accessToken: string;
}

export const biomedicaApi = {
  // Login/logout usam axios cru (o login estabelece o token; o logout limpa o cookie).
  async login(email: string, senha: string): Promise<SessaoBiomedica> {
    const res = await axios.post<SessaoBiomedica>(
      `${API_BASE}/biomedica/login`,
      { email, senha },
      { withCredentials: true },
    );
    return res.data;
  },

  async logout(): Promise<void> {
    await axios.post(`${API_BASE}/biomedica/logout`, {}, { withCredentials: true });
  },

  async conversas(): Promise<ConversaBiomedicaResponse[]> {
    const res = await apiBiomedica.get<{ conversas: ConversaBiomedicaResponse[] }>(
      '/biomedica/conversas',
    );
    return res.data.conversas;
  },

  async mensagens(conversaId: number): Promise<MensagemResponse[]> {
    const res = await apiBiomedica.get<{ mensagens: MensagemResponse[] }>(
      `/biomedica/conversas/${conversaId}/mensagens`,
    );
    return res.data.mensagens;
  },

  async responder(conversaId: number, conteudo: string): Promise<MensagemResponse> {
    const res = await apiBiomedica.post<MensagemResponse>(
      `/biomedica/conversas/${conversaId}/mensagens`,
      { conteudo },
    );
    return res.data;
  },

  async contexto(conversaId: number): Promise<ContextoClinicoResponse> {
    const res = await apiBiomedica.get<ContextoClinicoResponse>(
      `/biomedica/conversas/${conversaId}/contexto`,
    );
    return res.data;
  },

  async rotina(conversaId: number): Promise<RotinaEdicaoResponse> {
    const res = await apiBiomedica.get<RotinaEdicaoResponse>(
      `/biomedica/conversas/${conversaId}/rotina`,
    );
    return res.data;
  },

  async salvarRotina(conversaId: number, input: SalvarRotinaInput): Promise<void> {
    await apiBiomedica.put(`/biomedica/conversas/${conversaId}/rotina`, input);
  },

  async diario(conversaId: number): Promise<RegistroDiarioResponse[]> {
    const res = await apiBiomedica.get<{ registros: RegistroDiarioResponse[] }>(
      `/biomedica/conversas/${conversaId}/diario`,
    );
    return res.data.registros;
  },
};
