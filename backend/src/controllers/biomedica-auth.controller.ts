import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../errors/http-error.js';
import { loginSchema } from '../schemas/auth.schema.js';
import { biomedicaAuthService } from '../services/biomedica-auth.service.js';

const COOKIE_REFRESH = 'biomedicaRefreshToken';
const PATH_REFRESH = '/api/biomedica';

function setRefreshCookie(res: Response, refreshToken: string, expiraEm: Date): void {
  res.cookie(COOKIE_REFRESH, refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: PATH_REFRESH,
    expires: expiraEm,
  });
}

export const biomedicaAuthController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = loginSchema.parse(req.body);
      const resultado = await biomedicaAuthService.login(input);
      setRefreshCookie(res, resultado.refreshToken, resultado.refreshTokenExpiraEm);
      res.status(200).json({ biomedica: resultado.biomedica, accessToken: resultado.accessToken });
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
      const resultado = await biomedicaAuthService.refresh(refreshToken);
      setRefreshCookie(res, resultado.refreshToken, resultado.refreshTokenExpiraEm);
      res.status(200).json({ biomedica: resultado.biomedica, accessToken: resultado.accessToken });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cookies = req.cookies as Record<string, string | undefined>;
      const refreshToken = cookies[COOKIE_REFRESH];
      if (refreshToken) {
        await biomedicaAuthService.logout(refreshToken);
      }
      res.clearCookie(COOKIE_REFRESH, { path: PATH_REFRESH });
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
