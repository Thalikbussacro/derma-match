import type { Plano } from '@prisma/client';
import type { TipoUsuario } from '../services/token.service.js';

declare global {
  namespace Express {
    interface Request {
      usuario?: { id: number; tipoUsuario: TipoUsuario; plano?: Plano };
    }
  }
}

export {};
