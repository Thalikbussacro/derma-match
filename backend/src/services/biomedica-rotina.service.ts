import type { Produto } from '@prisma/client';
import type { ProdutoResumo, RotinaEdicaoResponse, SalvarRotinaInput } from '@derma-match/shared';
import { NotFoundError } from '../errors/http-error.js';
import { conversaRepository } from '../repositories/conversa.repository.js';
import { produtoRepository } from '../repositories/produto.repository.js';
import { respostaUsuarioRepository } from '../repositories/resposta-usuario.repository.js';
import { rotinaPersonalizadaRepository } from '../repositories/rotina-personalizada.repository.js';
import { rotinaRepository } from '../repositories/rotina.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';

function resumo(p: Produto): ProdutoResumo {
  return { id: p.id, nome: p.nome, marca: p.marca, etapa: p.etapa };
}

// Biomédica só acessa a rotina de paciente atribuída a ela (via conversa). RNF-LGPD-005.
async function usuarioDaConversa(biomedicaId: number, conversaId: number): Promise<number> {
  const conversa = await conversaRepository.buscarDaBiomedica(conversaId, biomedicaId);
  if (!conversa) {
    throw new NotFoundError('Conversa');
  }
  return conversa.usuarioId;
}

export const biomedicaRotinaService = {
  async obterParaEdicao(biomedicaId: number, conversaId: number): Promise<RotinaEdicaoResponse> {
    const usuarioId = await usuarioDaConversa(biomedicaId, conversaId);
    const usuario = await usuarioRepository.buscarPorId(usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }

    const personalizada = await rotinaPersonalizadaRepository.buscarPorUsuario(usuarioId);
    let existe = false;
    let atualizadoEm: string | null = null;
    let itens: RotinaEdicaoResponse['itens'];
    if (personalizada && personalizada.itens.length > 0) {
      existe = true;
      atualizadoEm = personalizada.atualizadoEm.toISOString();
      itens = personalizada.itens.map((i) => ({
        etapa: i.etapa,
        descricao: i.descricao,
        ordem: i.ordem,
        produtoId: i.produtoId,
      }));
    } else {
      // Sem personalizada: template a partir da rotina base do tipo de pele.
      const base = usuario.tipoPelePredominanteId
        ? await rotinaRepository.buscarPorTipoPele(usuario.tipoPelePredominanteId)
        : null;
      itens = (base?.itens ?? []).map((i) => ({
        etapa: i.etapa,
        descricao: i.descricao,
        ordem: i.ordem,
        produtoId: null,
      }));
    }

    const respostas = await respostaUsuarioRepository.listarPorUsuario(usuarioId);
    const opcaoIds = respostas.map((r) => r.opcaoId);
    const [sugeridos, catalogo] = await Promise.all([
      produtoRepository.listarSugeridosDasOpcoes(opcaoIds),
      produtoRepository.listar(),
    ]);

    return {
      existe,
      atualizadoEm,
      usuarioNome: usuario.nome,
      itens,
      produtosSugeridos: sugeridos.map(resumo),
      catalogo: catalogo.filter((p) => p.ativo).map(resumo),
    };
  },

  async salvar(
    biomedicaId: number,
    conversaId: number,
    input: SalvarRotinaInput,
  ): Promise<void> {
    const usuarioId = await usuarioDaConversa(biomedicaId, conversaId);
    await rotinaPersonalizadaRepository.salvar(
      usuarioId,
      biomedicaId,
      input.itens.map((i) => ({
        etapa: i.etapa,
        descricao: i.descricao,
        ordem: i.ordem,
        produtoId: i.produtoId,
      })),
      `${input.itens.length} item(ns) atualizados`,
    );
  },
};
