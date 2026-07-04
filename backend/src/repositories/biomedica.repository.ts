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

  // Biomédica ativa com menos conversas (menor carga). Empate → menor id (C5).
  async buscarComMenorCarga(): Promise<Biomedica | null> {
    const biomedicas = await prisma.biomedica.findMany({
      where: { ativa: true },
      include: { _count: { select: { conversas: true } } },
      orderBy: { id: 'asc' },
    });
    if (biomedicas.length === 0) {
      return null;
    }
    return biomedicas.reduce((menor, b) =>
      b._count.conversas < menor._count.conversas ? b : menor,
    );
  },

  criar(data: {
    nome: string;
    registro: string;
    email: string;
    senhaHash: string;
  }): Promise<Biomedica> {
    return prisma.biomedica.create({ data });
  },

  listar(): Promise<Biomedica[]> {
    return prisma.biomedica.findMany({ orderBy: { id: 'asc' } });
  },

  atualizarAtiva(id: number, ativa: boolean): Promise<Biomedica> {
    return prisma.biomedica.update({ where: { id }, data: { ativa } });
  },
};
