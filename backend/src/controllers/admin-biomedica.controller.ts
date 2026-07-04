import type { NextFunction, Request, Response } from 'express';
import { NotFoundError, ValidationError } from '../errors/http-error.js';
import { criarBiomedicaSchema } from '../schemas/admin.schema.js';
import { adminBiomedicaService } from '../services/admin-biomedica.service.js';

export const adminBiomedicaController = {
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const biomedicas = await adminBiomedicaService.listar();
      res.status(200).json(biomedicas);
    } catch (err) {
      next(err);
    }
  },

  criar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = criarBiomedicaSchema.parse(req.body);
      const biomedica = await adminBiomedicaService.criar(input);
      res.status(201).json(biomedica);
    } catch (err) {
      next(err);
    }
  },

  definirAtiva: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new NotFoundError('Biomédica');
      }
      const body = req.body as { ativa?: unknown };
      if (typeof body.ativa !== 'boolean') {
        throw new ValidationError('O campo "ativa" deve ser booleano.');
      }
      const biomedica = await adminBiomedicaService.definirAtiva(id, body.ativa);
      res.status(200).json(biomedica);
    } catch (err) {
      next(err);
    }
  },
};
