import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { cadastroSchema, loginSchema } from '../schemas/auth.schema.js';
import { authService } from '../services/auth.service.js';

const COOKIE_REFRESH = 'refreshToken';
const PATH_REFRESH = '/api/auth/refresh';

function setRefreshCookie(res: Response, refreshToken: string, expiraEm: Date): void {
  res.cookie(COOKIE_REFRESH, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: PATH_REFRESH,
    expires: expiraEm,
  });
}

export const authController = {
  cadastrar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = cadastroSchema.parse(req.body);
      const usuario = await authService.cadastrar(input);
      res.status(201).json(usuario);
    } catch (err) {
      next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = loginSchema.parse(req.body);
      const resultado = await authService.login(input);
      setRefreshCookie(res, resultado.refreshToken, resultado.refreshTokenExpiraEm);
      res.status(200).json({ usuario: resultado.usuario, accessToken: resultado.accessToken });
    } catch (err) {
      next(err);
    }
  },
};
