import { describe, expect, it } from 'vitest';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { cadastroSchema } from '../schemas/auth.schema.js';
import { authService } from './auth.service.js';

const inputValido = {
  nome: 'Maria',
  email: 'maria@example.com',
  senha: 'senha12345',
  aceiteLgpd: true as const,
};

describe('authService.cadastrar', () => {
  it('cadastra um novo usuário como FREE, guarda hash e consentimento, e não vaza a senha', async () => {
    const resultado = await authService.cadastrar(inputValido);

    expect(resultado.email).toBe(inputValido.email);
    expect(resultado.plano).toBe('FREE');
    expect(JSON.stringify(resultado)).not.toContain(inputValido.senha);

    const salvo = await usuarioRepository.buscarPorEmail(inputValido.email);
    expect(salvo?.consentimentoLgpdEm).toBeInstanceOf(Date);
    expect(salvo?.senhaHash).not.toBe(inputValido.senha);
  });

  it('rejeita cadastro com email duplicado', async () => {
    await authService.cadastrar(inputValido);
    await expect(authService.cadastrar(inputValido)).rejects.toThrow();
  });

  it('o schema rejeita cadastro sem aceite LGPD', () => {
    const semAceite = { nome: 'Ana', email: 'ana@example.com', senha: 'senha12345' };
    expect(cadastroSchema.safeParse(semAceite).success).toBe(false);
  });
});

describe('authService.login', () => {
  it('faz login com credenciais corretas e retorna tokens', async () => {
    await authService.cadastrar(inputValido);

    const resultado = await authService.login({
      email: inputValido.email,
      senha: inputValido.senha,
    });

    expect(resultado.accessToken.length).toBeGreaterThan(0);
    expect(resultado.refreshToken.length).toBeGreaterThan(0);
    expect(resultado.usuario.email).toBe(inputValido.email);
  });

  it('rejeita login com email inexistente com mensagem genérica', async () => {
    await expect(
      authService.login({ email: 'naoexiste@example.com', senha: 'qualquer1' }),
    ).rejects.toThrow('Credenciais inválidas.');
  });

  it('rejeita login com senha errada com mensagem genérica', async () => {
    await authService.cadastrar(inputValido);
    await expect(
      authService.login({ email: inputValido.email, senha: 'senhaerrada' }),
    ).rejects.toThrow('Credenciais inválidas.');
  });
});

describe('authService.refresh', () => {
  it('gera um novo par e revoga o refresh anterior (rotação)', async () => {
    await authService.cadastrar(inputValido);
    const login = await authService.login({ email: inputValido.email, senha: inputValido.senha });

    const novo = await authService.refresh(login.refreshToken);
    expect(novo.refreshToken).not.toBe(login.refreshToken);
    expect(novo.accessToken.length).toBeGreaterThan(0);

    // o refresh antigo foi revogado na rotação, não vale mais
    await expect(authService.refresh(login.refreshToken)).rejects.toThrow();
  });

  it('rejeita refresh com token revogado', async () => {
    await authService.cadastrar(inputValido);
    const login = await authService.login({ email: inputValido.email, senha: inputValido.senha });

    await authService.logout(login.refreshToken);
    await expect(authService.refresh(login.refreshToken)).rejects.toThrow();
  });
});

describe('authService.logout', () => {
  it('revoga o refresh token e é idempotente', async () => {
    await authService.cadastrar(inputValido);
    const login = await authService.login({ email: inputValido.email, senha: inputValido.senha });

    await authService.logout(login.refreshToken);
    await expect(authService.refresh(login.refreshToken)).rejects.toThrow();

    // logout de novo não quebra (idempotente)
    await expect(authService.logout(login.refreshToken)).resolves.toBeUndefined();
  });
});
