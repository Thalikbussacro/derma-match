import type { Conversa } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const conversaRepository = {
  buscarDoUsuario(usuarioId: number): Promise<Conversa | null> {
    return prisma.conversa.findFirst({ where: { usuarioId } });
  },

  buscarPorId(id: number): Promise<Conversa | null> {
    return prisma.conversa.findUnique({ where: { id } });
  },

  criar(usuarioId: number, biomedicaId: number): Promise<Conversa> {
    return prisma.conversa.create({ data: { usuarioId, biomedicaId } });
  },

  atualizarUltimaAtividade(id: number): Promise<Conversa> {
    return prisma.conversa.update({ where: { id }, data: { ultimaAtividade: new Date() } });
  },
};
