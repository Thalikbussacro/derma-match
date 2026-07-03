import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/http-error.js';
import { atualizarContaSchema } from '../schemas/conta.schema.js';
import { contaService } from '../services/conta.service.js';

function usuarioIdAutenticado(req: Request): number {
  if (!req.usuario) {
    throw new UnauthorizedError();
  }
  return req.usuario.id;
}

export const contaController = {
  buscarPerfil: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const perfil = await contaService.buscarPerfil(usuarioIdAutenticado(req));
      res.status(200).json(perfil);
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = atualizarContaSchema.parse(req.body);
      const perfil = await contaService.atualizar(usuarioIdAutenticado(req), input);
      res.status(200).json(perfil);
    } catch (err) {
      next(err);
    }
  },

  excluir: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await contaService.excluir(usuarioIdAutenticado(req));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
