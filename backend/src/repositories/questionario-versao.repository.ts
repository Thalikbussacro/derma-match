import type { QuestionarioVersao, StatusQuestionario } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const questionarioVersaoRepository = {
  buscarPublicada(): Promise<QuestionarioVersao | null> {
    return prisma.questionarioVersao.findFirst({ where: { status: 'PUBLICADO' } });
  },

  buscarRascunho(): Promise<QuestionarioVersao | null> {
    return prisma.questionarioVersao.findFirst({ where: { status: 'RASCUNHO' } });
  },

  buscarPorId(id: number): Promise<QuestionarioVersao | null> {
    return prisma.questionarioVersao.findUnique({ where: { id } });
  },

  listar(): Promise<QuestionarioVersao[]> {
    return prisma.questionarioVersao.findMany({ orderBy: { numero: 'desc' } });
  },

  async proximoNumero(): Promise<number> {
    const agg = await prisma.questionarioVersao.aggregate({ _max: { numero: true } });
    return (agg._max.numero ?? 0) + 1;
  },

  criar(numero: number): Promise<QuestionarioVersao> {
    return prisma.questionarioVersao.create({ data: { numero, status: 'RASCUNHO' } });
  },

  atualizarStatus(
    id: number,
    status: StatusQuestionario,
    publicadoEm?: Date | null,
  ): Promise<QuestionarioVersao> {
    return prisma.questionarioVersao.update({ where: { id }, data: { status, publicadoEm } });
  },
};
