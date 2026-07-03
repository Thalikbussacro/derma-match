import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { describe, expect, it, vi } from 'vitest';
import { env } from '../config/env.js';
import { HttpError } from '../errors/http-error.js';
import { tokenService } from '../services/token.service.js';
import { authenticate } from './authenticate.js';

function reqComHeader(authorization?: string): Request {
  return { headers: authorization ? { authorization } : {} } as unknown as Request;
}

const res = {} as Response;

describe('authenticate', () => {
  it('lança 401 quando não há header Authorization', () => {
    const next = vi.fn();
    expect(() => authenticate(reqComHeader(), res, next as NextFunction)).toThrow(HttpError);
    expect(next).not.toHaveBeenCalled();
  });

  it('popula req.usuario com token válido e chama next', () => {
    const token = tokenService.gerarAccessToken(99, 'FREE');
    const req = reqComHeader(`Bearer ${token}`);
    const next = vi.fn();

    authenticate(req, res, next as NextFunction);

    expect(req.usuario).toEqual({ id: 99, plano: 'FREE' });
    expect(next).toHaveBeenCalledOnce();
  });

  it('lança 401 com código TOKEN_EXPIRADO para token expirado', () => {
    const expirado = jwt.sign({ plano: 'FREE' }, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      expiresIn: -1,
      subject: '5',
    });

    let capturado: unknown;
    try {
      authenticate(reqComHeader(`Bearer ${expirado}`), res, vi.fn() as NextFunction);
    } catch (err) {
      capturado = err;
    }

    expect(capturado).toBeInstanceOf(HttpError);
    expect((capturado as HttpError).status).toBe(401);
    expect((capturado as HttpError).codigo).toBe('TOKEN_EXPIRADO');
  });
});
