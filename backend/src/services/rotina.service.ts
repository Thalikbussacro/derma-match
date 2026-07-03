import { NotFoundError, ValidationError } from '../errors/http-error.js';
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

  const rotina = await rotinaRepository.buscarPorTipoPele(usuario.tipoPelePredominanteId);
  if (!rotina) {
    // Não deveria acontecer com o seed correto (toda pele tem rotina).
    throw new NotFoundError('Rotina', 'ROTINA_NAO_ENCONTRADA');
  }

  return {
    id: rotina.id,
    tipoPele: { id: rotina.tipoPele.id, nome: rotina.tipoPele.nome },
    descricao: rotina.descricao,
    itens: rotina.itens.map((item) => ({
      id: item.id,
      etapa: item.etapa,
      descricao: item.descricao,
      ordem: item.ordem,
    })),
  };
}

export const rotinaService = {
  buscarDoUsuario,
};
