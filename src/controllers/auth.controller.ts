import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/http-error.js';
import { cadastroSchema, loginSchema } from '../schemas/auth.schema.js';
import { authService } from '../services/auth.service.js';

const COOKIE_REFRESH = 'refreshToken';
// Path abrange /api/auth/refresh e /api/auth/logout (ambos precisam ler o cookie httpOnly).
// Amplia o ADR-0004 (que citava só /api/auth/refresh); formalizado na task 1.19.
const PATH_REFRESH = '/api/auth';

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

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookies = req.cookies as Record<string, string | undefined>;
      const refreshToken = cookies[COOKIE_REFRESH];
      if (!refreshToken) {
        throw new UnauthorizedError('Refresh token ausente.', 'REFRESH_AUSENTE');
      }
      const resultado = await authService.refresh(refreshToken);
      setRefreshCookie(res, resultado.refreshToken, resultado.refreshTokenExpiraEm);
      res.status(200).json({ usuario: resultado.usuario, accessToken: resultado.accessToken });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookies = req.cookies as Record<string, string | undefined>;
      const refreshToken = cookies[COOKIE_REFRESH];
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      res.clearCookie(COOKIE_REFRESH, { path: PATH_REFRESH });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
