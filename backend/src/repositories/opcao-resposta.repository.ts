import { prisma } from '../lib/prisma.js';

export const opcaoRespostaRepository = {
  buscarPorId(id: number) {
    return prisma.opcaoResposta.findUnique({
      where: { id },
      include: { pergunta: true, pesos: true },
    });
  },

  criar(data: { perguntaId: number; texto: string }) {
    return prisma.opcaoResposta.create({ data });
  },

  atualizar(id: number, texto: string) {
    return prisma.opcaoResposta.update({ where: { id }, data: { texto } });
  },

  remover(id: number) {
    return prisma.opcaoResposta.delete({ where: { id } });
  },
};
