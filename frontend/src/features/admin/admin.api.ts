import axios from 'axios';
import type {
  AdminResponse,
  AssociarProdutoInput,
  AtualizarDicaInput,
  ConversaAdmin,
  CriarDicaInput,
  DashboardResponse,
  DicaAdmin,
  AtualizarPerguntaInput,
  AtualizarProdutoInput,
  AtualizarTipoPeleInput,
  BiomedicaAdmin,
  CriarBiomedicaInput,
  CriarOpcaoInput,
  CriarPerguntaInput,
  CriarProdutoInput,
  CriarTipoPeleInput,
  DefinirPesoInput,
  ProdutoAdmin,
  QuestionarioRascunho,
  TipoPeleAdmin,
} from '@derma-match/shared';
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

  // --- Questionário configurável (rascunho) ---
  async rascunhoQuestionario(): Promise<QuestionarioRascunho> {
    const res = await apiAdmin.get<QuestionarioRascunho>('/admin/questionario/rascunho');
    return res.data;
  },
  async publicarQuestionario(): Promise<void> {
    await apiAdmin.post('/admin/questionario/publicar');
  },
  async criarPergunta(input: CriarPerguntaInput): Promise<void> {
    await apiAdmin.post('/admin/questionario/perguntas', input);
  },
  async atualizarPergunta(id: number, input: AtualizarPerguntaInput): Promise<void> {
    await apiAdmin.patch(`/admin/questionario/perguntas/${id}`, input);
  },
  async removerPergunta(id: number): Promise<void> {
    await apiAdmin.delete(`/admin/questionario/perguntas/${id}`);
  },
  async criarOpcao(input: CriarOpcaoInput): Promise<void> {
    await apiAdmin.post('/admin/questionario/opcoes', input);
  },
  async atualizarOpcao(id: number, texto: string): Promise<void> {
    await apiAdmin.patch(`/admin/questionario/opcoes/${id}`, { texto });
  },
  async removerOpcao(id: number): Promise<void> {
    await apiAdmin.delete(`/admin/questionario/opcoes/${id}`);
  },
  async definirPeso(input: DefinirPesoInput): Promise<void> {
    await apiAdmin.put('/admin/questionario/pesos', input);
  },

  // --- Tipos de pele (espectro) ---
  async tiposPele(): Promise<TipoPeleAdmin[]> {
    const res = await apiAdmin.get<TipoPeleAdmin[]>('/admin/tipos-pele');
    return res.data;
  },
  async criarTipoPele(input: CriarTipoPeleInput): Promise<void> {
    await apiAdmin.post('/admin/tipos-pele', input);
  },
  async atualizarTipoPele(id: number, input: AtualizarTipoPeleInput): Promise<void> {
    await apiAdmin.patch(`/admin/tipos-pele/${id}`, input);
  },

  // --- Catálogo de produtos ---
  async produtos(): Promise<ProdutoAdmin[]> {
    const res = await apiAdmin.get<ProdutoAdmin[]>('/admin/produtos');
    return res.data;
  },
  async criarProduto(input: CriarProdutoInput): Promise<void> {
    await apiAdmin.post('/admin/produtos', input);
  },
  async atualizarProduto(id: number, input: AtualizarProdutoInput): Promise<void> {
    await apiAdmin.patch(`/admin/produtos/${id}`, input);
  },
  async associarProduto(input: AssociarProdutoInput): Promise<void> {
    await apiAdmin.post('/admin/produtos/associar', input);
  },
  async desassociarProduto(input: AssociarProdutoInput): Promise<void> {
    await apiAdmin.post('/admin/produtos/desassociar', input);
  },

  // --- Conversas (atribuição) ---
  async conversas(): Promise<ConversaAdmin[]> {
    const res = await apiAdmin.get<ConversaAdmin[]>('/admin/conversas');
    return res.data;
  },
  async reatribuirConversa(id: number, biomedicaId: number): Promise<void> {
    await apiAdmin.patch(`/admin/conversas/${id}/biomedica`, { biomedicaId });
  },

  async dashboard(): Promise<DashboardResponse> {
    const res = await apiAdmin.get<DashboardResponse>('/admin/dashboard');
    return res.data;
  },

  // --- Dicas ---
  async dicas(): Promise<DicaAdmin[]> {
    const res = await apiAdmin.get<DicaAdmin[]>('/admin/dicas');
    return res.data;
  },
  async criarDica(input: CriarDicaInput): Promise<void> {
    await apiAdmin.post('/admin/dicas', input);
  },
  async atualizarDica(id: number, input: AtualizarDicaInput): Promise<void> {
    await apiAdmin.patch(`/admin/dicas/${id}`, input);
  },
};
