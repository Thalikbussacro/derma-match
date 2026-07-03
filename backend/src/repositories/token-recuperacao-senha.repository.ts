import type { TokenRecuperacaoSenha } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const tokenRecuperacaoSenhaRepository = {
  criar(data: {
    usuarioId: number;
    tokenHash: string;
    expiraEm: Date;
  }): Promise<TokenRecuperacaoSenha> {
    return prisma.tokenRecuperacaoSenha.create({ data });
  },

  buscarPorHash(tokenHash: string): Promise<TokenRecuperacaoSenha | null> {
    return prisma.tokenRecuperacaoSenha.findUnique({ where: { tokenHash } });
  },

  marcarUsado(id: number): Promise<TokenRecuperacaoSenha> {
    return prisma.tokenRecuperacaoSenha.update({
      where: { id },
      data: { usadoEm: new Date() },
    });
  },

  async invalidarTodosDoUsuario(usuarioId: number): Promise<number> {
    const resultado = await prisma.tokenRecuperacaoSenha.updateMany({
      where: { usuarioId, usadoEm: null },
      data: { usadoEm: new Date() },
    });
    return resultado.count;
  },
};
