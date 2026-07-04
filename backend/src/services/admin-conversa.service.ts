import type { ConversaAdmin } from '@derma-match/shared';
import { NotFoundError, ValidationError } from '../errors/http-error.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';
import { conversaRepository } from '../repositories/conversa.repository.js';

export const adminConversaService = {
  async listar(): Promise<ConversaAdmin[]> {
    const conversas = await conversaRepository.listarTodas();
    return conversas.map((c) => ({
      id: c.id,
      usuarioNome: c.usuario.nome,
      biomedicaId: c.biomedica.id,
      biomedicaNome: c.biomedica.nome,
      mensagens: c._count.mensagens,
      ultimaAtividade: c.ultimaAtividade.toISOString(),
    }));
  },

  async reatribuir(conversaId: number, biomedicaId: number): Promise<void> {
    const conversa = await conversaRepository.buscarPorId(conversaId);
    if (!conversa) {
      throw new NotFoundError('Conversa');
    }
    const biomedica = await biomedicaRepository.buscarPorId(biomedicaId);
    if (!biomedica) {
      throw new NotFoundError('Biomédica');
    }
    if (!biomedica.ativa) {
      throw new ValidationError('Biomédica inativa não recebe atribuições.', 'BIOMEDICA_INATIVA');
    }
    await conversaRepository.reatribuir(conversaId, biomedicaId);
  },
};
