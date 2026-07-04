import type { EtapaRotina, Prisma, Produto } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export const produtoRepository = {
  listar(): Promise<Produto[]> {
    return prisma.produto.findMany({ orderBy: [{ etapa: 'asc' }, { nome: 'asc' }] });
  },

  buscarPorId(id: number): Promise<Produto | null> {
    return prisma.produto.findUnique({ where: { id } });
  },

  criar(data: {
    nome: string;
    marca: string | null;
    etapa: EtapaRotina;
    descricao: string;
  }): Promise<Produto> {
    return prisma.produto.create({ data });
  },

  atualizar(id: number, data: Prisma.ProdutoUpdateInput): Promise<Produto> {
    return prisma.produto.update({ where: { id }, data });
  },

  associar(opcaoId: number, produtoId: number) {
    return prisma.opcaoProdutoSugerido.upsert({
      where: { opcaoId_produtoId: { opcaoId, produtoId } },
      update: {},
      create: { opcaoId, produtoId },
    });
  },

  async desassociar(opcaoId: number, produtoId: number): Promise<void> {
    await prisma.opcaoProdutoSugerido.deleteMany({ where: { opcaoId, produtoId } });
  },

  // Produtos ativos sugeridos por uma opção (usado na sugestão inicial de rotina — C6).
  listarSugeridosDaOpcao(opcaoId: number): Promise<Produto[]> {
    return prisma.produto.findMany({ where: { ativo: true, sugestoes: { some: { opcaoId } } } });
  },
};
