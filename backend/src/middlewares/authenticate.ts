import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../errors/http-error.js';
import { tokenService } from '../services/token.service.js';
import type { AccessTokenPayload } from '../services/token.service.js';

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Token de acesso ausente.', 'TOKEN_AUSENTE');
  }

  const token = header.slice('Bearer '.length).trim();

  let payload: AccessTokenPayload;
  try {
    payload = tokenService.verificarAccessToken(token);
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token de acesso expirado.', 'TOKEN_EXPIRADO');
    }
    throw new UnauthorizedError('Token de acesso inválido.', 'TOKEN_INVALIDO');
  }

  req.usuario = { id: payload.sub, plano: payload.plano };
  next();
}
