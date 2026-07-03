import type { RefreshToken } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const refreshTokenRepository = {
  criar(data: { usuarioId: number; tokenHash: string; expiraEm: Date }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  buscarPorHash(tokenHash: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { tokenHash } });
  },

  revogar(id: number): Promise<RefreshToken> {
    return prisma.refreshToken.update({
      where: { id },
      data: { revogadoEm: new Date() },
    });
  },

  async revogarTodosDoUsuario(usuarioId: number): Promise<number> {
    const resultado = await prisma.refreshToken.updateMany({
      where: { usuarioId, revogadoEm: null },
      data: { revogadoEm: new Date() },
    });
    return resultado.count;
  },

  async removerExpirados(): Promise<number> {
    const resultado = await prisma.refreshToken.deleteMany({
      where: { expiraEm: { lt: new Date() } },
    });
    return resultado.count;
  },
};
