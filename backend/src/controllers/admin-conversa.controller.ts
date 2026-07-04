import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/http-error.js';
import { reatribuirSchema } from '../schemas/admin.schema.js';
import { adminConversaService } from '../services/admin-conversa.service.js';

export const adminConversaController = {
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await adminConversaService.listar());
    } catch (err) {
      next(err);
    }
  },

  reatribuir: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new NotFoundError('Conversa');
      }
      const { biomedicaId } = reatribuirSchema.parse(req.body);
      await adminConversaService.reatribuir(id, biomedicaId);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
