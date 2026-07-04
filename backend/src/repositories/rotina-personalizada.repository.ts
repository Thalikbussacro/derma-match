import type { EtapaRotina } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const rotinaPersonalizadaRepository = {
  buscarPorUsuario(usuarioId: number) {
    return prisma.rotinaPersonalizada.findUnique({
      where: { usuarioId },
      include: { itens: { orderBy: { ordem: 'asc' }, include: { produto: true } } },
    });
  },

  // Substitui todos os itens e registra a alteração, em transação. Faz upsert da rotina.
  async salvar(
    usuarioId: number,
    biomedicaId: number,
    itens: { etapa: EtapaRotina; descricao: string; ordem: number; produtoId: number | null }[],
    resumo: string,
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      const rotina = await tx.rotinaPersonalizada.upsert({
        where: { usuarioId },
        update: { biomedicaId },
        create: { usuarioId, biomedicaId },
      });
      await tx.itemRotinaPersonalizada.deleteMany({ where: { rotinaPersonalizadaId: rotina.id } });
      for (const item of itens) {
        await tx.itemRotinaPersonalizada.create({
          data: {
            rotinaPersonalizadaId: rotina.id,
            etapa: item.etapa,
            descricao: item.descricao,
            ordem: item.ordem,
            produtoId: item.produtoId,
          },
        });
      }
      await tx.rotinaAlteracao.create({
        data: { rotinaPersonalizadaId: rotina.id, biomedicaId, resumo },
      });
    });
  },
};
