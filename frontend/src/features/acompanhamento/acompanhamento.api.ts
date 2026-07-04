import type {
  AdesaoResponse,
  CriarRegistroDiarioInput,
  DicaResponse,
  RegistroDiarioResponse,
} from '@derma-match/shared';
import { api } from '../../lib/api';

export const acompanhamentoApi = {
  async listarDiario(): Promise<RegistroDiarioResponse[]> {
    const res = await api.get<RegistroDiarioResponse[]>('/diario');
    return res.data;
  },
  async criarRegistro(input: CriarRegistroDiarioInput): Promise<RegistroDiarioResponse> {
    const res = await api.post<RegistroDiarioResponse>('/diario', input);
    return res.data;
  },
  async removerRegistro(id: number): Promise<void> {
    await api.delete(`/diario/${id}`);
  },
  async adesao(): Promise<AdesaoResponse> {
    const res = await api.get<AdesaoResponse>('/rotina/adesao');
    return res.data;
  },
  async checkin(): Promise<AdesaoResponse> {
    const res = await api.post<AdesaoResponse>('/rotina/checkin');
    return res.data;
  },
  async dicas(): Promise<DicaResponse[]> {
    const res = await api.get<DicaResponse[]>('/dicas');
    return res.data;
  },
};
