import type { Dica, Prisma } from '@prisma/client';
import type { AtualizarDicaInput, CriarDicaInput, DicaAdmin } from '@derma-match/shared';
import { NotFoundError } from '../errors/http-error.js';
import { dicaRepository } from '../repositories/dica.repository.js';

function paraAdmin(d: Dica): DicaAdmin {
  return { id: d.id, titulo: d.titulo, conteudo: d.conteudo, ativa: d.ativa };
}

export const adminDicaService = {
  async listar(): Promise<DicaAdmin[]> {
    return (await dicaRepository.listar()).map(paraAdmin);
  },

  async criar(input: CriarDicaInput): Promise<DicaAdmin> {
    return paraAdmin(await dicaRepository.criar(input));
  },

  async atualizar(id: number, input: AtualizarDicaInput): Promise<DicaAdmin> {
    const existe = await dicaRepository.buscarPorId(id);
    if (!existe) {
      throw new NotFoundError('Dica');
    }
    const data: Prisma.DicaUpdateInput = {};
    if (input.titulo !== undefined) data.titulo = input.titulo;
    if (input.conteudo !== undefined) data.conteudo = input.conteudo;
    if (input.ativa !== undefined) data.ativa = input.ativa;
    return paraAdmin(await dicaRepository.atualizar(id, data));
  },
};
