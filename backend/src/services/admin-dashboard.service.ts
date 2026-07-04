import type { DashboardResponse } from '@derma-match/shared';
import { prisma } from '../lib/prisma.js';
import { tipoPeleRepository } from '../repositories/tipo-pele.repository.js';

export const adminDashboardService = {
  async obter(): Promise<DashboardResponse> {
    const [usuariasFree, usuariasPremium, biomedicasAtivas, biomedicasTotal, conversas, porTipo, tipos] =
      await Promise.all([
        prisma.usuario.count({ where: { plano: 'FREE' } }),
        prisma.usuario.count({ where: { plano: 'PREMIUM' } }),
        prisma.biomedica.count({ where: { ativa: true } }),
        prisma.biomedica.count(),
        prisma.conversa.count(),
        prisma.usuario.groupBy({
          by: ['tipoPelePredominanteId'],
          _count: true,
          where: { tipoPelePredominanteId: { not: null } },
        }),
        tipoPeleRepository.listar(),
      ]);

    const distribuicaoTipoPele = tipos.map((t) => ({
      nome: t.nome,
      total: porTipo.find((g) => g.tipoPelePredominanteId === t.id)?._count ?? 0,
    }));

    return {
      usuariasFree,
      usuariasPremium,
      biomedicasAtivas,
      biomedicasTotal,
      conversas,
      distribuicaoTipoPele,
    };
  },
};
