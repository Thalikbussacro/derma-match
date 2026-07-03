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

  // Respostas com o texto da pergunta e da opção, para o contexto clínico da biomédica.
  listarComContexto(usuarioId: number) {
    return prisma.respostaUsuario.findMany({
      where: { usuarioId },
      include: { pergunta: true, opcao: true },
      orderBy: { pergunta: { ordem: 'asc' } },
    });
  },

  upsert(usuarioId: number, perguntaId: number, opcaoId: number) {
    return prisma.respostaUsuario.upsert({
      where: { usuarioId_perguntaId: { usuarioId, perguntaId } },
      update: { opcaoId },
      create: { usuarioId, perguntaId, opcaoId },
    });
  },

  // Refazer o questionário: apaga as respostas e zera o tipo de pele em uma única transação.
  async refazerQuestionario(usuarioId: number): Promise<void> {
    await prisma.$transaction([
      prisma.respostaUsuario.deleteMany({ where: { usuarioId } }),
      prisma.usuario.update({ where: { id: usuarioId }, data: { tipoPelePredominanteId: null } }),
    ]);
  },
};
