import { describe, expect, it } from 'vitest';
import { UnauthorizedError } from '../errors/http-error.js';
import { adminAuthService } from './admin-auth.service.js';

// Credenciais do admin único criado no seed.
const CRED = { email: 'admin@dermamatch.com', senha: 'admin123' };

describe('adminAuthService', () => {
  it('login com credenciais válidas retorna o admin e tokens', async () => {
    const resultado = await adminAuthService.login(CRED);
    expect(resultado.admin.email).toBe(CRED.email);
    expect(resultado.accessToken.length).toBeGreaterThan(0);
    expect(resultado.refreshToken.length).toBeGreaterThan(0);
  });

  it('login com senha errada é rejeitado', async () => {
    await expect(adminAuthService.login({ email: CRED.email, senha: 'errada' })).rejects.toThrow(
      UnauthorizedError,
    );
  });

  it('refresh rotaciona e o token antigo reusado é rejeitado', async () => {
    const login = await adminAuthService.login(CRED);
    const rotacionado = await adminAuthService.refresh(login.refreshToken);
    expect(rotacionado.accessToken.length).toBeGreaterThan(0);
    await expect(adminAuthService.refresh(login.refreshToken)).rejects.toThrow(UnauthorizedError);
  });
});
