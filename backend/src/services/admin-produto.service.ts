import type { Prisma, Produto } from '@prisma/client';
import type {
  AssociarProdutoInput,
  AtualizarProdutoInput,
  CriarProdutoInput,
  ProdutoAdmin,
} from '@derma-match/shared';
import { NotFoundError } from '../errors/http-error.js';
import { opcaoRespostaRepository } from '../repositories/opcao-resposta.repository.js';
import { produtoRepository } from '../repositories/produto.repository.js';

function paraResponse(p: Produto): ProdutoAdmin {
  return {
    id: p.id,
    nome: p.nome,
    marca: p.marca,
    etapa: p.etapa,
    descricao: p.descricao,
    ativo: p.ativo,
  };
}

export const adminProdutoService = {
  async listar(): Promise<ProdutoAdmin[]> {
    return (await produtoRepository.listar()).map(paraResponse);
  },

  async criar(input: CriarProdutoInput): Promise<ProdutoAdmin> {
    const criado = await produtoRepository.criar({
      nome: input.nome,
      marca: input.marca ?? null,
      etapa: input.etapa,
      descricao: input.descricao,
    });
    return paraResponse(criado);
  },

  async atualizar(id: number, input: AtualizarProdutoInput): Promise<ProdutoAdmin> {
    const existente = await produtoRepository.buscarPorId(id);
    if (!existente) {
      throw new NotFoundError('Produto');
    }
    const data: Prisma.ProdutoUpdateInput = {};
    if (input.nome !== undefined) data.nome = input.nome;
    if (input.marca !== undefined) data.marca = input.marca;
    if (input.etapa !== undefined) data.etapa = input.etapa;
    if (input.descricao !== undefined) data.descricao = input.descricao;
    if (input.ativo !== undefined) data.ativo = input.ativo;
    return paraResponse(await produtoRepository.atualizar(id, data));
  },

  async associar(input: AssociarProdutoInput): Promise<void> {
    const opcao = await opcaoRespostaRepository.buscarPorId(input.opcaoId);
    if (!opcao) {
      throw new NotFoundError('Opção');
    }
    const produto = await produtoRepository.buscarPorId(input.produtoId);
    if (!produto) {
      throw new NotFoundError('Produto');
    }
    await produtoRepository.associar(input.opcaoId, input.produtoId);
  },

  async desassociar(input: AssociarProdutoInput): Promise<void> {
    await produtoRepository.desassociar(input.opcaoId, input.produtoId);
  },

  async remover(id: number): Promise<void> {
    const existente = await produtoRepository.buscarPorId(id);
    if (!existente) {
      throw new NotFoundError('Produto');
    }
    await produtoRepository.remover(id);
  },
};
