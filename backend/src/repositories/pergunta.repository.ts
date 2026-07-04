import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const perguntaRepository = {
  // Navegação da usuária: perguntas de uma versão específica.
  listarOrdenadas(versaoId: number) {
    return prisma.pergunta.findMany({
      where: { questionarioVersaoId: versaoId },
      orderBy: { ordem: 'asc' },
      include: { opcoes: true },
    });
  },

  contar(versaoId: number): Promise<number> {
    return prisma.pergunta.count({ where: { questionarioVersaoId: versaoId } });
  },

  // Edição/clonagem no admin: perguntas com opções e pesos.
  listarCompletas(versaoId: number) {
    return prisma.pergunta.findMany({
      where: { questionarioVersaoId: versaoId },
      orderBy: { ordem: 'asc' },
      include: { opcoes: { include: { pesos: true } } },
    });
  },

  buscarPorId(id: number) {
    return prisma.pergunta.findUnique({
      where: { id },
      include: { opcoes: { include: { pesos: true } } },
    });
  },

  criar(data: {
    questionarioVersaoId: number;
    texto: string;
    ordem: number;
    dependeDeOpcaoId?: number | null;
  }) {
    return prisma.pergunta.create({ data });
  },

  atualizar(id: number, data: Prisma.PerguntaUpdateInput) {
    return prisma.pergunta.update({ where: { id }, data });
  },

  remover(id: number) {
    return prisma.pergunta.delete({ where: { id } });
  },
};
