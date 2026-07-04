import type { Admin } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const adminRepository = {
  buscarPorEmail(email: string): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { email } });
  },

  buscarPorId(id: number): Promise<Admin | null> {
    return prisma.admin.findUnique({ where: { id } });
  },
};
