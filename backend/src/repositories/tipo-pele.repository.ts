import type { TipoPele } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const tipoPeleRepository = {
  buscarPorId(id: number): Promise<TipoPele | null> {
    return prisma.tipoPele.findUnique({ where: { id } });
  },

  // Ordenado pela posição no espectro (C3); desempate por id.
  listar(): Promise<TipoPele[]> {
    return prisma.tipoPele.findMany({ orderBy: [{ ordem: 'asc' }, { id: 'asc' }] });
  },

  criar(data: { nome: string; descricao: string; ordem: number }): Promise<TipoPele> {
    return prisma.tipoPele.create({ data });
  },

  atualizar(
    id: number,
    data: { nome?: string; descricao?: string; ordem?: number },
  ): Promise<TipoPele> {
    return prisma.tipoPele.update({ where: { id }, data });
  },
};
