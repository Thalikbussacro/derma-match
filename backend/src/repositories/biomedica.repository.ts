import type { Biomedica } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const biomedicaRepository = {
  buscarPorEmail(email: string): Promise<Biomedica | null> {
    return prisma.biomedica.findUnique({ where: { email } });
  },

  buscarPorId(id: number): Promise<Biomedica | null> {
    return prisma.biomedica.findUnique({ where: { id } });
  },

  // A biomédica única (ativa) à qual novas conversas Premium são associadas (ADR-0011).
  buscarAtiva(): Promise<Biomedica | null> {
    return prisma.biomedica.findFirst({ where: { ativa: true }, orderBy: { id: 'asc' } });
  },
};
