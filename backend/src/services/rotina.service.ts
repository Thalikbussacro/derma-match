import { NotFoundError, ValidationError } from '../errors/http-error.js';
import { rotinaPersonalizadaRepository } from '../repositories/rotina-personalizada.repository.js';
import { rotinaRepository } from '../repositories/rotina.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import type { RotinaResponse } from '../schemas/rotina.schema.js';

async function buscarDoUsuario(usuarioId: number): Promise<RotinaResponse> {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError('Usuário');
  }
  if (usuario.tipoPelePredominanteId === null) {
    throw new ValidationError(
      'Complete o questionário para ver sua rotina.',
      'QUESTIONARIO_INCOMPLETO',
    );
  }

  const base = await rotinaRepository.buscarPorTipoPele(usuario.tipoPelePredominanteId);
  if (!base) {
    // Não deveria acontecer com o seed correto (toda pele tem rotina).
    throw new NotFoundError('Rotina', 'ROTINA_NAO_ENCONTRADA');
  }

  // Rotina personalizada pela biomédica tem prioridade sobre a base do tipo (C6).
  const personalizada = await rotinaPersonalizadaRepository.buscarPorUsuario(usuarioId);
  if (personalizada && personalizada.itens.length > 0) {
    return {
      id: personalizada.id,
      tipoPele: { id: base.tipoPele.id, nome: base.tipoPele.nome },
      descricao: 'Rotina personalizada pela sua biomédica.',
      itens: personalizada.itens.map((item) => ({
        id: item.id,
        etapa: item.etapa,
        descricao: item.produto ? `${item.descricao} · ${item.produto.nome}` : item.descricao,
        ordem: item.ordem,
      })),
      personalizadaEm: personalizada.atualizadoEm.toISOString(),
    };
  }

  return {
    id: base.id,
    tipoPele: { id: base.tipoPele.id, nome: base.tipoPele.nome },
    descricao: base.descricao,
    itens: base.itens.map((item) => ({
      id: item.id,
      etapa: item.etapa,
      descricao: item.descricao,
      ordem: item.ordem,
    })),
    personalizadaEm: null,
  };
}

export const rotinaService = {
  buscarDoUsuario,
};
