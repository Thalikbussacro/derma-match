import type { Anexo, AutorMensagem, Mensagem } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export type MensagemComAnexos = Mensagem & { anexos: Anexo[] };

export const mensagemRepository = {
  criar(data: {
    conversaId: number;
    autorTipo: AutorMensagem;
    autorId: number;
    conteudo: string;
  }): Promise<Mensagem> {
    return prisma.mensagem.create({ data });
  },

  listarPorConversa(conversaId: number): Promise<MensagemComAnexos[]> {
    return prisma.mensagem.findMany({
      where: { conversaId },
      orderBy: { criadoEm: 'asc' },
      include: { anexos: true },
    });
  },
};
