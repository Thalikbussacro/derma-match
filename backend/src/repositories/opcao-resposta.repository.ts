import { prisma } from '../lib/prisma.js';

export const opcaoRespostaRepository = {
  buscarPorId(id: number) {
    return prisma.opcaoResposta.findUnique({
      where: { id },
      include: { pergunta: true, pesos: true },
    });
  },
};
