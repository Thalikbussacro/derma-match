import type { NextFunction, Request, Response } from 'express';
import { NotFoundError, UnauthorizedError } from '../errors/http-error.js';
import { UPLOADS_DIR } from '../lib/uploads.js';
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
      const { caminhoRel, tipo } = await anexoService.localizarParaDownload(id, {
        tipoUsuario: req.usuario.tipoUsuario,
        id: req.usuario.id,
      });
      // Dado sensível (foto de pele): não cachear em proxies/navegador compartilhado.
      res.setHeader('Cache-Control', 'private, no-store');
      res.type(tipo);
      res.sendFile(caminhoRel, { root: UPLOADS_DIR });
    } catch (err) {
      next(err);
    }
  },
};
