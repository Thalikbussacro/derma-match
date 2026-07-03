import { prisma } from '../lib/prisma.js';

export const respostaUsuarioRepository = {
  listarPorUsuario(usuarioId: number) {
    return prisma.respostaUsuario.findMany({
      where: { usuarioId },
      include: { opcao: { include: { pesos: true } } },
    });
  },

  contarPorUsuario(usuarioId: number): Promise<number> {
    return prisma.respostaUsuario.count({ where: { usuarioId } });
  },

  upsert(usuarioId: number, perguntaId: number, opcaoId: number) {
    return prisma.respostaUsuario.upsert({
      where: { usuarioId_perguntaId: { usuarioId, perguntaId } },
      update: { opcaoId },
      create: { usuarioId, perguntaId, opcaoId },
    });
  },

  async removerTodasDoUsuario(usuarioId: number): Promise<number> {
    const resultado = await prisma.respostaUsuario.deleteMany({ where: { usuarioId } });
    return resultado.count;
  },
};
