import type { Dica, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const dicaRepository = {
  listar(): Promise<Dica[]> {
    return prisma.dica.findMany({ orderBy: { id: 'desc' } });
  },

  listarAtivas(): Promise<Dica[]> {
    return prisma.dica.findMany({ where: { ativa: true }, orderBy: { id: 'desc' } });
  },

  buscarPorId(id: number): Promise<Dica | null> {
    return prisma.dica.findUnique({ where: { id } });
  },

  criar(data: { titulo: string; conteudo: string }): Promise<Dica> {
    return prisma.dica.create({ data });
  },

  atualizar(id: number, data: Prisma.DicaUpdateInput): Promise<Dica> {
    return prisma.dica.update({ where: { id }, data });
  },
};
