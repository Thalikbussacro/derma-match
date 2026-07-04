import { Prisma } from '@prisma/client';
import type { TipoPele } from '@prisma/client';
import type { AtualizarTipoPeleInput, CriarTipoPeleInput, TipoPeleAdmin } from '@derma-match/shared';
import { ConflictError, NotFoundError } from '../errors/http-error.js';
import { tipoPeleRepository } from '../repositories/tipo-pele.repository.js';

function paraResponse(t: TipoPele): TipoPeleAdmin {
  return { id: t.id, nome: t.nome, descricao: t.descricao, ordem: t.ordem };
}

function ehNomeDuplicado(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}

export const adminTipoPeleService = {
  async listar(): Promise<TipoPeleAdmin[]> {
    return (await tipoPeleRepository.listar()).map(paraResponse);
  },

  async criar(input: CriarTipoPeleInput): Promise<TipoPeleAdmin> {
    try {
      return paraResponse(await tipoPeleRepository.criar(input));
    } catch (err) {
      if (ehNomeDuplicado(err)) {
        throw new ConflictError('Já existe um tipo de pele com esse nome.');
      }
      throw err;
    }
  },

  async atualizar(id: number, input: AtualizarTipoPeleInput): Promise<TipoPeleAdmin> {
    const existente = await tipoPeleRepository.buscarPorId(id);
    if (!existente) {
      throw new NotFoundError('Tipo de pele');
    }
    try {
      return paraResponse(await tipoPeleRepository.atualizar(id, input));
    } catch (err) {
      if (ehNomeDuplicado(err)) {
        throw new ConflictError('Já existe um tipo de pele com esse nome.');
      }
      throw err;
    }
  },
};
