import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/http-error.js';
import { biomedicaIdAutenticado } from '../lib/usuario-autenticado.js';
import { salvarRotinaSchema } from '../schemas/rotina.schema.js';
import { biomedicaRotinaService } from '../services/biomedica-rotina.service.js';

function conversaIdParam(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new NotFoundError('Conversa');
  }
  return id;
}

export const biomedicaRotinaController = {
  obter: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rotina = await biomedicaRotinaService.obterParaEdicao(
        biomedicaIdAutenticado(req),
        conversaIdParam(req),
      );
      res.status(200).json(rotina);
    } catch (err) {
      next(err);
    }
  },

  salvar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await biomedicaRotinaService.salvar(
        biomedicaIdAutenticado(req),
        conversaIdParam(req),
        salvarRotinaSchema.parse(req.body),
      );
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
