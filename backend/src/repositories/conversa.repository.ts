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

  // Conversas de uma biomédica, com o nome da usuária e a última mensagem (para a listagem).
  listarDaBiomedica(biomedicaId: number) {
    return prisma.conversa.findMany({
      where: { biomedicaId },
      orderBy: { ultimaAtividade: 'desc' },
      include: {
        usuario: { select: { nome: true } },
        mensagens: { orderBy: { criadoEm: 'desc' }, take: 1 },
      },
    });
  },

  buscarDaBiomedica(conversaId: number, biomedicaId: number): Promise<Conversa | null> {
    return prisma.conversa.findFirst({ where: { id: conversaId, biomedicaId } });
  },

  // Remove conversas inativas (cascade apaga mensagens e anexos). Ver ADR-0014.
  async removerInativas(anteriorA: Date): Promise<number> {
    const resultado = await prisma.conversa.deleteMany({
      where: { ultimaAtividade: { lt: anteriorA } },
    });
    return resultado.count;
  },
};
