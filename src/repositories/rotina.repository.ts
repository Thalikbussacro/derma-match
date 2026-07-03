import { prisma } from '../lib/prisma.js';

export const rotinaRepository = {
  buscarPorTipoPele(tipoPeleId: number) {
    return prisma.rotina.findUnique({
      where: { tipoPeleId },
      include: {
        tipoPele: true,
        itens: { orderBy: { ordem: 'asc' } },
      },
    });
  },
};
