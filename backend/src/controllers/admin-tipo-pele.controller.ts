import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/http-error.js';
import { atualizarTipoPeleSchema, criarTipoPeleSchema } from '../schemas/admin.schema.js';
import { adminTipoPeleService } from '../services/admin-tipo-pele.service.js';

export const adminTipoPeleController = {
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await adminTipoPeleService.listar());
    } catch (err) {
      next(err);
    }
  },

  criar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const criado = await adminTipoPeleService.criar(criarTipoPeleSchema.parse(req.body));
      res.status(201).json(criado);
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new NotFoundError('Tipo de pele');
      }
      const atualizado = await adminTipoPeleService.atualizar(id, atualizarTipoPeleSchema.parse(req.body));
      res.status(200).json(atualizado);
    } catch (err) {
      next(err);
    }
  },
};
