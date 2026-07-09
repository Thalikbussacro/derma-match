import { describe, expect, it } from 'vitest';
import { NotFoundError } from '../errors/http-error.js';
import { adminProdutoService } from './admin-produto.service.js';
import { questionarioAdminService } from './questionario-admin.service.js';

describe('adminProdutoService', () => {
  it('cria um produto e ele aparece na listagem', async () => {
    const criado = await adminProdutoService.criar({
      nome: 'Produto Teste',
      marca: 'Linha Teste',
      etapa: 'HIDRATACAO',
      descricao: 'Produto criado no teste automatizado.',
    });
    expect(criado.id).toBeGreaterThan(0);
    expect(criado.ativo).toBe(true);

    const lista = await adminProdutoService.listar();
    expect(lista.some((p) => p.id === criado.id)).toBe(true);
  });

  it('atualiza campos parciais sem afetar os demais', async () => {
    const criado = await adminProdutoService.criar({
      nome: 'Produto Original',
      marca: null,
      etapa: 'LIMPEZA',
      descricao: 'Descrição original.',
    });

    const atualizado = await adminProdutoService.atualizar(criado.id, { ativo: false });
    expect(atualizado.ativo).toBe(false);
    expect(atualizado.nome).toBe('Produto Original');
    expect(atualizado.etapa).toBe('LIMPEZA');
  });

  it('atualizar produto inexistente lança NotFoundError', async () => {
    await expect(adminProdutoService.atualizar(999999, { ativo: false })).rejects.toThrow(
      NotFoundError,
    );
  });

  it('associa um produto a uma opção existente do questionário', async () => {
    const rascunho = await questionarioAdminService.obterRascunho();
    const opcao = rascunho.perguntas[0]?.opcoes[0];
    if (!opcao) throw new Error('nenhuma opção seedada encontrada');

    const produto = await adminProdutoService.criar({
      nome: 'Produto Associável',
      marca: null,
      etapa: 'TRATAMENTO',
      descricao: 'Usado para testar associação.',
    });

    await expect(
      adminProdutoService.associar({ opcaoId: opcao.id, produtoId: produto.id }),
    ).resolves.toBeUndefined();

    await expect(
      adminProdutoService.desassociar({ opcaoId: opcao.id, produtoId: produto.id }),
    ).resolves.toBeUndefined();
  });

  it('associar com produto inexistente lança NotFoundError', async () => {
    const rascunho = await questionarioAdminService.obterRascunho();
    const opcao = rascunho.perguntas[0]?.opcoes[0];
    if (!opcao) throw new Error('nenhuma opção seedada encontrada');

    await expect(
      adminProdutoService.associar({ opcaoId: opcao.id, produtoId: 999999 }),
    ).rejects.toThrow(NotFoundError);
  });

  it('associar com opção inexistente lança NotFoundError', async () => {
    const produto = await adminProdutoService.criar({
      nome: 'Produto Sem Opção',
      marca: null,
      etapa: 'TONIFICACAO',
      descricao: 'Usado para testar opção inexistente.',
    });

    await expect(
      adminProdutoService.associar({ opcaoId: 999999, produtoId: produto.id }),
    ).rejects.toThrow(NotFoundError);
  });
});
