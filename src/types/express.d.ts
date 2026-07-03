import type { Plano } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; plano: Plano };
    }
  }
}

export {};
