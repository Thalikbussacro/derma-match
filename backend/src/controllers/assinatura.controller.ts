import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors/http-error.js';
import { usuarioIdAutenticado } from '../lib/usuario-autenticado.js';
import { assinaturaService } from '../services/assinatura.service.js';

export const assinaturaController = {
  assinar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { consentimentoDadosSensiveis?: unknown };
      if (body.consentimentoDadosSensiveis !== true) {
        throw new ValidationError(
          'É preciso consentir com o tratamento dos dados de saúde para assinar.',
          'CONSENTIMENTO_NECESSARIO',
        );
      }
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
