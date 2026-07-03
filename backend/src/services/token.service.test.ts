import jwt from 'jsonwebtoken';
import { describe, expect, it } from 'vitest';
import { env } from '../config/env.js';
import { tokenService } from './token.service.js';

describe('tokenService', () => {
  it('gera e verifica um access token', () => {
    const token = tokenService.gerarAccessToken(42, 'USUARIA', 'FREE');
    const payload = tokenService.verificarAccessToken(token);
    expect(payload.sub).toBe(42);
    expect(payload.tipoUsuario).toBe('USUARIA');
    expect(payload.plano).toBe('FREE');
  });

  it('gera um refresh token com jti e o verifica', () => {
    const token = tokenService.gerarRefreshToken(7, 'USUARIA');
    const payload = tokenService.verificarRefreshToken(token);
    expect(payload.sub).toBe(7);
    expect(payload.tipoUsuario).toBe('USUARIA');
    expect(payload.jti.length).toBeGreaterThan(0);
  });

  it('rejeita access token expirado', () => {
    const expirado = jwt.sign({ plano: 'FREE' }, env.JWT_ACCESS_SECRET, {
      algorithm: 'HS256',
      expiresIn: -1,
      subject: '42',
    });
    expect(() => tokenService.verificarAccessToken(expirado)).toThrow();
  });

  it('rejeita token com assinatura errada', () => {
    const forjado = jwt.sign({ plano: 'FREE' }, 'segredo_completamente_diferente_com_32_chars', {
      algorithm: 'HS256',
      subject: '42',
    });
    expect(() => tokenService.verificarAccessToken(forjado)).toThrow();
  });
});
