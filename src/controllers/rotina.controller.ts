import type { NextFunction, Request, Response } from 'express';
import { usuarioIdAutenticado } from '../lib/usuario-autenticado.js';
import { rotinaService } from '../services/rotina.service.js';

export const rotinaController = {
  buscarDoUsuario: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rotina = await rotinaService.buscarDoUsuario(usuarioIdAutenticado(req));
      res.status(200).json(rotina);
    } catch (err) {
      next(err);
    }
  },
};
