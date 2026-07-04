import type { NextFunction, Request, Response } from 'express';
import { dicaService } from '../services/dica.service.js';

export const dicaController = {
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await dicaService.listarAtivas());
    } catch (err) {
      next(err);
    }
  },
};
