import { describe, expect, it } from 'vitest';
import { UnauthorizedError } from '../errors/http-error.js';
import { biomedicaAuthService } from './biomedica-auth.service.js';

// Credenciais da biomédica única criada no seed.
const CRED = { email: 'biomedica@dermamatch.com', senha: 'biomedica123' };

describe('biomedicaAuthService', () => {
  it('login com credenciais válidas retorna a biomédica e tokens', async () => {
    const resultado = await biomedicaAuthService.login(CRED);
    expect(resultado.biomedica.email).toBe(CRED.email);
    expect(resultado.accessToken.length).toBeGreaterThan(0);
    expect(resultado.refreshToken.length).toBeGreaterThan(0);
  });

  it('login com senha errada é rejeitado', async () => {
    await expect(
      biomedicaAuthService.login({ email: CRED.email, senha: 'errada' }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('login com email inexistente é rejeitado', async () => {
    await expect(
      biomedicaAuthService.login({ email: 'nao@existe.com', senha: 'x' }),
    ).rejects.toThrow(UnauthorizedError);
  });

  it('refresh rotaciona e o token antigo reusado é rejeitado', async () => {
    const login = await biomedicaAuthService.login(CRED);
    const rotacionado = await biomedicaAuthService.refresh(login.refreshToken);
    expect(rotacionado.accessToken.length).toBeGreaterThan(0);
    // Reuso do refresh já rotacionado dispara a detecção de reuso.
    await expect(biomedicaAuthService.refresh(login.refreshToken)).rejects.toThrow(UnauthorizedError);
  });
});
