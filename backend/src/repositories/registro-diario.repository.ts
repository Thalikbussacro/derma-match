import type { RegistroDiario } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const registroDiarioRepository = {
  criar(data: {
    usuarioId: number;
    condicao: number;
    tags: string[];
    nota: string | null;
  }): Promise<RegistroDiario> {
    return prisma.registroDiario.create({ data });
  },

  listarPorUsuario(usuarioId: number, limite = 60): Promise<RegistroDiario[]> {
    return prisma.registroDiario.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
      take: limite,
    });
  },

  buscarPorId(id: number): Promise<RegistroDiario | null> {
    return prisma.registroDiario.findUnique({ where: { id } });
  },

  async remover(id: number): Promise<void> {
    await prisma.registroDiario.delete({ where: { id } });
  },
};
