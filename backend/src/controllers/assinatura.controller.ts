import type { NextFunction, Request, Response } from 'express';
import { usuarioIdAutenticado } from '../lib/usuario-autenticado.js';
import { assinaturaService } from '../services/assinatura.service.js';

export const assinaturaController = {
  assinar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = await assinaturaService.assinar(usuarioIdAutenticado(req));
      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  },

  cancelar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const usuario = await assinaturaService.cancelar(usuarioIdAutenticado(req));
      res.status(200).json(usuario);
    } catch (err) {
      next(err);
    }
  },
};
