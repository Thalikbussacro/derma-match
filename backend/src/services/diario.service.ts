import type { RegistroDiario } from '@prisma/client';
import type { CriarRegistroDiarioInput, RegistroDiarioResponse } from '@derma-match/shared';
import { ForbiddenError, NotFoundError } from '../errors/http-error.js';
import { registroDiarioRepository } from '../repositories/registro-diario.repository.js';

function paraResponse(r: RegistroDiario): RegistroDiarioResponse {
  return {
    id: r.id,
    condicao: r.condicao,
    tags: r.tags,
    nota: r.nota,
    criadoEm: r.criadoEm.toISOString(),
  };
}

export const diarioService = {
  async listar(usuarioId: number): Promise<RegistroDiarioResponse[]> {
    return (await registroDiarioRepository.listarPorUsuario(usuarioId)).map(paraResponse);
  },

  async criar(usuarioId: number, input: CriarRegistroDiarioInput): Promise<RegistroDiarioResponse> {
    const registro = await registroDiarioRepository.criar({
      usuarioId,
      condicao: input.condicao,
      tags: input.tags,
      nota: input.nota ?? null,
    });
    return paraResponse(registro);
  },

  async remover(usuarioId: number, id: number): Promise<void> {
    const registro = await registroDiarioRepository.buscarPorId(id);
    if (!registro) {
      throw new NotFoundError('Registro');
    }
    if (registro.usuarioId !== usuarioId) {
      throw new ForbiddenError('Registro de outra usuária.');
    }
    await registroDiarioRepository.remover(id);
  },

  // Leitura pela biomédica (autorização é feita por quem chama, via conversa).
  async listarDe(usuarioId: number): Promise<RegistroDiarioResponse[]> {
    return (await registroDiarioRepository.listarPorUsuario(usuarioId, 30)).map(paraResponse);
  },
};
