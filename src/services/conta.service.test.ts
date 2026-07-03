import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../errors/http-error.js';
import { authService } from './auth.service.js';
import { contaService } from './conta.service.js';

const inputValido = {
  nome: 'Carlos',
  email: 'carlos@example.com',
  senha: 'senha12345',
  aceiteLgpd: true as const,
};

async function criarUsuario(): Promise<number> {
  const usuario = await authService.cadastrar(inputValido);
  return usuario.id;
}

describe('contaService', () => {
  it('buscarPerfil retorna os dados do usuário', async () => {
    const id = await criarUsuario();
    const perfil = await contaService.buscarPerfil(id);
    expect(perfil.email).toBe(inputValido.email);
    expect(perfil.plano).toBe('FREE');
  });

  it('buscarPerfil lança para usuário inexistente', async () => {
    await expect(contaService.buscarPerfil(999999)).rejects.toThrow(NotFoundError);
  });

  it('atualizar troca o nome', async () => {
    const id = await criarUsuario();
    const perfil = await contaService.atualizar(id, { nome: 'Carlos Silva' });
    expect(perfil.nome).toBe('Carlos Silva');
  });

  it('atualizar troca a senha e revoga os refresh tokens', async () => {
    const id = await criarUsuario();
    const login = await authService.login({ email: inputValido.email, senha: inputValido.senha });

    await contaService.atualizar(id, { senhaAtual: inputValido.senha, novaSenha: 'novaSenha123' });

    const novoLogin = await authService.login({
      email: inputValido.email,
      senha: 'novaSenha123',
    });
    expect(novoLogin.accessToken.length).toBeGreaterThan(0);
    await expect(authService.refresh(login.refreshToken)).rejects.toThrow();
  });

  it('atualizar rejeita senha atual incorreta', async () => {
    const id = await criarUsuario();
    await expect(
      contaService.atualizar(id, { senhaAtual: 'errada123', novaSenha: 'novaSenha123' }),
    ).rejects.toThrow('Senha atual incorreta.');
  });

  it('excluir remove a conta', async () => {
    const id = await criarUsuario();
    await contaService.excluir(id);
    await expect(contaService.buscarPerfil(id)).rejects.toThrow(NotFoundError);
  });
});
