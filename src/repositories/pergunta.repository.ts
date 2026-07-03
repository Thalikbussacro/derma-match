import { prisma } from '../lib/prisma.js';

export const perguntaRepository = {
  listarOrdenadas() {
    return prisma.pergunta.findMany({
      orderBy: { ordem: 'asc' },
      include: { opcoes: true },
    });
  },

  contar(): Promise<number> {
    return prisma.pergunta.count();
  },
};
