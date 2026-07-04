import type { CheckinRotina } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const checkinRotinaRepository = {
  async marcar(usuarioId: number, dia: Date): Promise<void> {
    await prisma.checkinRotina.upsert({
      where: { usuarioId_dia: { usuarioId, dia } },
      update: {},
      create: { usuarioId, dia },
    });
  },

  listarDesde(usuarioId: number, desde: Date): Promise<CheckinRotina[]> {
    return prisma.checkinRotina.findMany({
      where: { usuarioId, dia: { gte: desde } },
      orderBy: { dia: 'asc' },
    });
  },
};
