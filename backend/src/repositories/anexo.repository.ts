import type { Anexo, Conversa } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export type AnexoComConversa = Anexo & { mensagem: { conversa: Conversa } };

export const anexoRepository = {
  criar(data: {
    mensagemId: number;
    tipo: string;
    caminho: string;
    dataExpiracao: Date;
  }): Promise<Anexo> {
    return prisma.anexo.create({ data });
  },

  buscarComConversa(id: number): Promise<AnexoComConversa | null> {
    return prisma.anexo.findUnique({
      where: { id },
      include: { mensagem: { include: { conversa: true } } },
    });
  },

  listarExpirados(): Promise<Anexo[]> {
    return prisma.anexo.findMany({ where: { dataExpiracao: { lt: new Date() } } });
  },

  remover(id: number): Promise<Anexo> {
    return prisma.anexo.delete({ where: { id } });
  },
};
