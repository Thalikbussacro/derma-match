import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import type { Plano } from '@prisma/client';
import { env } from '../config/env.js';

const accessPayloadSchema = z.object({
  sub: z.coerce.number().int(),
  plano: z.enum(['FREE', 'PREMIUM']),
});

const refreshPayloadSchema = z.object({
  sub: z.coerce.number().int(),
  jti: z.string().min(1),
  exp: z.number().int(),
});

export type AccessTokenPayload = z.infer<typeof accessPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshPayloadSchema>;

export const tokenService = {
  gerarAccessToken(usuarioId: number, plano: Plano): string {
    return jwt.sign({ plano }, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.JWT_ACCESS_EXPIRATION as jwt.SignOptions['expiresIn'],
      subject: String(usuarioId),
    });
  },

  gerarRefreshToken(usuarioId: number): string {
    return jwt.sign({}, env.JWT_REFRESH_SECRET, {
      algorithm: 'HS256',
      expiresIn: env.JWT_REFRESH_EXPIRATION as jwt.SignOptions['expiresIn'],
      subject: String(usuarioId),
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
