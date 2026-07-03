import { prisma } from '../lib/prisma.js';

export const pesoOpcaoPeleRepository = {
  listarPorOpcoes(opcaoIds: number[]) {
    return prisma.pesoOpcaoPele.findMany({
      where: { opcaoId: { in: opcaoIds } },
    });
  },
};
