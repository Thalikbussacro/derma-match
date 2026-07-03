import type { NextFunction, Request, Response } from 'express';
import { NotFoundError, UnauthorizedError } from '../errors/http-error.js';
import { anexoService } from '../services/anexo.service.js';

export const anexoController = {
  baixar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.usuario) {
        throw new UnauthorizedError('Não autenticado.');
      }
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new NotFoundError('Anexo');
      }
      const { caminhoAbs, tipo } = await anexoService.localizarParaDownload(id, {
        tipoUsuario: req.usuario.tipoUsuario,
        id: req.usuario.id,
      });
      res.type(tipo);
      res.sendFile(caminhoAbs);
    } catch (err) {
      next(err);
    }
  },
};
