import type { NextFunction, Request, Response } from 'express';
import { atualizarDicaSchema, criarDicaSchema } from '@derma-match/shared';
import { NotFoundError } from '../errors/http-error.js';
import { adminDicaService } from '../services/admin-dica.service.js';

export const adminDicaController = {
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await adminDicaService.listar());
    } catch (err) {
      next(err);
    }
  },

  criar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json(await adminDicaService.criar(criarDicaSchema.parse(req.body)));
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new NotFoundError('Dica');
      }
      res.status(200).json(await adminDicaService.atualizar(id, atualizarDicaSchema.parse(req.body)));
    } catch (err) {
      next(err);
    }
  },
};
