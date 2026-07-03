import { describe, expect, it } from 'vitest';
import { usuarioRepository } from './usuario.repository.js';

describe('usuarioRepository', () => {
  it('cria um usuário e o encontra por email', async () => {
    const criado = await usuarioRepository.criar({
      nome: 'Maria',
      email: 'maria@example.com',
      senhaHash: 'hash-de-teste',
      consentimentoLgpdEm: new Date(),
    });

    expect(criado.id).toBeGreaterThan(0);
    expect(criado.email).toBe('maria@example.com');
    expect(criado.plano).toBe('FREE');

    const encontrado = await usuarioRepository.buscarPorEmail('maria@example.com');
    expect(encontrado?.id).toBe(criado.id);
  });

  it('retorna null ao buscar email que não existe', async () => {
    const encontrado = await usuarioRepository.buscarPorEmail('naoexiste@example.com');
    expect(encontrado).toBeNull();
  });
});
