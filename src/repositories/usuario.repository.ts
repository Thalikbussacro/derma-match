import type { Prisma, Usuario } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const usuarioRepository = {
  criar(data: {
    nome: string;
    email: string;
    senhaHash: string;
    consentimentoLgpdEm: Date;
  }): Promise<Usuario> {
    return prisma.usuario.create({ data });
  },

  buscarPorId(id: number): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { id } });
  },

  buscarPorEmail(email: string): Promise<Usuario | null> {
    return prisma.usuario.findUnique({ where: { email } });
  },

  atualizar(id: number, data: Prisma.UsuarioUpdateInput): Promise<Usuario> {
    return prisma.usuario.update({ where: { id }, data });
  },

  remover(id: number): Promise<Usuario> {
    return prisma.usuario.delete({ where: { id } });
  },

  atualizarTipoPelePredominante(id: number, tipoPelePredominanteId: number): Promise<Usuario> {
    return prisma.usuario.update({
      where: { id },
      data: { tipoPelePredominanteId },
    });
  },
};
