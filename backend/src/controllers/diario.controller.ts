import type { NextFunction, Request, Response } from 'express';
import { criarRegistroDiarioSchema } from '@derma-match/shared';
import { NotFoundError } from '../errors/http-error.js';
import { usuarioIdAutenticado } from '../lib/usuario-autenticado.js';
import { diarioService } from '../services/diario.service.js';

export const diarioController = {
  listar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await diarioService.listar(usuarioIdAutenticado(req)));
    } catch (err) {
      next(err);
    }
  },

  criar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registro = await diarioService.criar(
        usuarioIdAutenticado(req),
        criarRegistroDiarioSchema.parse(req.body),
      );
      res.status(201).json(registro);
    } catch (err) {
      next(err);
    }
  },

  remover: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new NotFoundError('Registro');
      }
      await diarioService.remover(usuarioIdAutenticado(req), id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
