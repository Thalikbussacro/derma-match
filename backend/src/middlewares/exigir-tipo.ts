import type { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors/http-error.js';
import type { TipoUsuario } from '../services/token.service.js';

// Garante que a requisição autenticada é do tipo esperado (usuária vs biomédica).
function exigirTipo(tipo: TipoUsuario) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      throw new UnauthorizedError('Não autenticado.');
    }
    if (req.usuario.tipoUsuario !== tipo) {
      throw new ForbiddenError('Acesso não permitido para este tipo de conta.');
    }
    next();
  };
}

export const exigirUsuaria = exigirTipo('USUARIA');
export const exigirBiomedica = exigirTipo('BIOMEDICA');
