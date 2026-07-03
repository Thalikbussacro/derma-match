import { prisma } from '../lib/prisma.js';

export const perguntaRepository = {
  listarOrdenadas() {
    return prisma.pergunta.findMany({
      orderBy: { ordem: 'asc' },
      include: { opcoes: true },
    });
  },

  buscarPorId(id: number) {
    return prisma.pergunta.findUnique({
      where: { id },
      include: { opcoes: true },
    });
  },

  contar(): Promise<number> {
    return prisma.pergunta.count();
  },
};
