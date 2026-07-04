import type { DicaResponse } from '@derma-match/shared';
import { dicaRepository } from '../repositories/dica.repository.js';

export const dicaService = {
  async listarAtivas(): Promise<DicaResponse[]> {
    return (await dicaRepository.listarAtivas()).map((d) => ({
      id: d.id,
      titulo: d.titulo,
      conteudo: d.conteudo,
    }));
  },
};
