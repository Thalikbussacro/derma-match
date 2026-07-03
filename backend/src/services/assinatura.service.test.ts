import { describe, expect, it } from 'vitest';
import { ConflictError } from '../errors/http-error.js';
import { assinaturaService } from './assinatura.service.js';
import { authService } from './auth.service.js';

async function criarUsuario(): Promise<number> {
  const usuario = await authService.cadastrar({
    nome: 'Ana',
    email: 'ana@example.com',
    senha: 'senha12345',
    aceiteLgpd: true,
  });
  return usuario.id;
}

describe('assinaturaService', () => {
  it('assinar muda o plano para PREMIUM', async () => {
    const id = await criarUsuario();
    const resultado = await assinaturaService.assinar(id);
    expect(resultado.plano).toBe('PREMIUM');
  });

  it('assinar quando já é PREMIUM lança ConflictError', async () => {
    const id = await criarUsuario();
    await assinaturaService.assinar(id);
    await expect(assinaturaService.assinar(id)).rejects.toThrow(ConflictError);
  });

  it('cancelar volta o plano para FREE', async () => {
    const id = await criarUsuario();
    await assinaturaService.assinar(id);
    const resultado = await assinaturaService.cancelar(id);
    expect(resultado.plano).toBe('FREE');
  });

  it('cancelar sem assinatura ativa lança ConflictError', async () => {
    const id = await criarUsuario();
    await expect(assinaturaService.cancelar(id)).rejects.toThrow(ConflictError);
  });
});
