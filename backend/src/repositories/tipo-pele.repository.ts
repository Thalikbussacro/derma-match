import type { TipoPele } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const tipoPeleRepository = {
  buscarPorId(id: number): Promise<TipoPele | null> {
    return prisma.tipoPele.findUnique({ where: { id } });
  },
};
