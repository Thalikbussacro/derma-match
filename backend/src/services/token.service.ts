import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Plano } from '@prisma/client';
import { env } from '../config/env.js';

export const TIPOS_USUARIO = ['USUARIA', 'BIOMEDICA', 'ADMIN'] as const;
export type TipoUsuario = (typeof TIPOS_USUARIO)[number];

const accessPayloadSchema = z.object({
  sub: z.coerce.number().int(),
  tipoUsuario: z.enum(TIPOS_USUARIO),
  // Só a usuária carrega plano; a biomédica não.
  plano: z.enum(['FREE', 'PREMIUM']).optional(),
});

const refreshPayloadSchema = z.object({
  sub: z.coerce.number().int(),
  tipoUsuario: z.enum(TIPOS_USUARIO),
  jti: z.string().min(1),
  exp: z.number().int(),
});

export type AccessTokenPayload = z.infer<typeof accessPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshPayloadSchema>;

export const tokenService = {
  gerarAccessToken(sub: number, tipoUsuario: TipoUsuario, plano?: Plano): string {
    const claims: Record<string, unknown> = { tipoUsuario };
    if (plano) {
      claims.plano = plano;
    }
    return jwt.sign(claims, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.JWT_ACCESS_EXPIRATION as jwt.SignOptions['expiresIn'],
      subject: String(sub),
    });
  },

  gerarRefreshToken(sub: number, tipoUsuario: TipoUsuario): string {
    return jwt.sign({ tipoUsuario }, env.JWT_REFRESH_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.JWT_REFRESH_EXPIRATION as jwt.SignOptions['expiresIn'],
      subject: String(sub),
      jwtid: randomUUID(),
    });
  },

  verificarAccessToken(token: string): AccessTokenPayload {
    return accessPayloadSchema.parse(
      jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] }),
    );
  },

  verificarRefreshToken(token: string): RefreshTokenPayload {
    return refreshPayloadSchema.parse(
      jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] }),
    );
  },
};
