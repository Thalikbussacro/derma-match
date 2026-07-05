import { Prisma } from '@prisma/client';
import type { QuestionarioVersao } from '@prisma/client';
import type {
  AtualizarOpcaoInput,
  AtualizarPerguntaInput,
  CriarOpcaoInput,
  CriarPerguntaInput,
  DefinirPesoInput,
  QuestionarioRascunho,
} from '@derma-match/shared';
import { prisma } from '../lib/prisma.js';
import { ConflictError, NotFoundError, ValidationError } from '../errors/http-error.js';
import { opcaoRespostaRepository } from '../repositories/opcao-resposta.repository.js';
import { perguntaRepository } from '../repositories/pergunta.repository.js';
import { questionarioVersaoRepository } from '../repositories/questionario-versao.repository.js';
import { tipoPeleRepository } from '../repositories/tipo-pele.repository.js';

function ehP2002(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002';
}

// Clona a versão publicada num novo rascunho, remapeando dependências para as novas opções.
async function clonarPublicada(): Promise<QuestionarioVersao> {
  const publicada = await questionarioVersaoRepository.buscarPublicada();
  const numero = await questionarioVersaoRepository.proximoNumero();
  return prisma.$transaction(async (tx) => {
    const rascunho = await tx.questionarioVersao.create({ data: { numero, status: 'RASCUNHO' } });
    if (!publicada) {
      return rascunho;
    }
    const perguntas = await tx.pergunta.findMany({
      where: { questionarioVersaoId: publicada.id },
      orderBy: { ordem: 'asc' },
      include: { opcoes: { include: { pesos: true } } },
    });
    const mapaOpcao = new Map<number, number>();
    const dependencias: { novaPerguntaId: number; oldDependeId: number }[] = [];
    for (const p of perguntas) {
      const nova = await tx.pergunta.create({
        data: { questionarioVersaoId: rascunho.id, texto: p.texto, ordem: p.ordem },
      });
      if (p.dependeDeOpcaoId !== null) {
        dependencias.push({ novaPerguntaId: nova.id, oldDependeId: p.dependeDeOpcaoId });
      }
      for (const o of p.opcoes) {
        const novaOpcao = await tx.opcaoResposta.create({
          data: { perguntaId: nova.id, texto: o.texto },
        });
        mapaOpcao.set(o.id, novaOpcao.id);
        for (const peso of o.pesos) {
          await tx.pesoOpcaoPele.create({
            data: { opcaoId: novaOpcao.id, tipoPeleId: peso.tipoPeleId, peso: peso.peso },
          });
        }
      }
    }
    for (const d of dependencias) {
      const novoDepende = mapaOpcao.get(d.oldDependeId);
      if (novoDepende !== undefined) {
        await tx.pergunta.update({
          where: { id: d.novaPerguntaId },
          data: { dependeDeOpcaoId: novoDepende },
        });
      }
    }
    return rascunho;
  });
}

async function garantirRascunho(): Promise<QuestionarioVersao> {
  const existente = await questionarioVersaoRepository.buscarRascunho();
  return existente ?? clonarPublicada();
}

// Garante que a pergunta pertence ao rascunho (bloqueia edição de versões publicadas/arquivadas).
async function perguntaDoRascunho(perguntaId: number, rascunhoId: number) {
  const pergunta = await perguntaRepository.buscarPorId(perguntaId);
  if (!pergunta || pergunta.questionarioVersaoId !== rascunhoId) {
    throw new NotFoundError('Pergunta no rascunho');
  }
  return pergunta;
}

async function opcaoDoRascunho(opcaoId: number, rascunhoId: number) {
  const opcao = await opcaoRespostaRepository.buscarPorId(opcaoId);
  if (!opcao || opcao.pergunta.questionarioVersaoId !== rascunhoId) {
    throw new NotFoundError('Opção no rascunho');
  }
  return opcao;
}

export const questionarioAdminService = {
  async obterRascunho(): Promise<QuestionarioRascunho> {
    const rascunho = await garantirRascunho();
    const [perguntas, tipos] = await Promise.all([
      perguntaRepository.listarCompletas(rascunho.id),
      tipoPeleRepository.listar(),
    ]);
    return {
      versaoId: rascunho.id,
      numero: rascunho.numero,
      tipos: tipos.map((t) => ({ id: t.id, nome: t.nome })),
      perguntas: perguntas.map((p) => ({
        id: p.id,
        texto: p.texto,
        ordem: p.ordem,
        dependeDeOpcaoId: p.dependeDeOpcaoId,
        opcoes: p.opcoes.map((o) => ({
          id: o.id,
          texto: o.texto,
          pesos: o.pesos.map((peso) => ({ tipoPeleId: peso.tipoPeleId, peso: peso.peso })),
          produtosSugeridos: o.produtosSugeridos.map((s) => s.produtoId),
        })),
      })),
    };
  },

  async publicar(): Promise<void> {
    const rascunho = await questionarioVersaoRepository.buscarRascunho();
    if (!rascunho) {
      throw new NotFoundError('Rascunho do questionário');
    }
    const total = await perguntaRepository.contar(rascunho.id);
    if (total === 0) {
      throw new ValidationError('O rascunho não tem perguntas.', 'RASCUNHO_VAZIO');
    }
    const publicada = await questionarioVersaoRepository.buscarPublicada();
    await prisma.$transaction(async (tx) => {
      if (publicada) {
        await tx.questionarioVersao.update({
          where: { id: publicada.id },
          data: { status: 'ARQUIVADO' },
        });
      }
      await tx.questionarioVersao.update({
        where: { id: rascunho.id },
        data: { status: 'PUBLICADO', publicadoEm: new Date() },
      });
    });
  },

  async criarPergunta(input: CriarPerguntaInput): Promise<void> {
    const rascunho = await garantirRascunho();
    try {
      await perguntaRepository.criar({
        questionarioVersaoId: rascunho.id,
        texto: input.texto,
        ordem: input.ordem,
        dependeDeOpcaoId: input.dependeDeOpcaoId ?? null,
      });
    } catch (err) {
      if (ehP2002(err)) {
        throw new ConflictError('Já existe uma pergunta com essa ordem.');
      }
      throw err;
    }
  },

  async atualizarPergunta(id: number, input: AtualizarPerguntaInput): Promise<void> {
    const rascunho = await garantirRascunho();
    await perguntaDoRascunho(id, rascunho.id);
    try {
      await perguntaRepository.atualizar(id, {
        ...(input.texto !== undefined && { texto: input.texto }),
        ...(input.ordem !== undefined && { ordem: input.ordem }),
        ...(input.dependeDeOpcaoId !== undefined && {
          dependeDeOpcao:
            input.dependeDeOpcaoId === null
              ? { disconnect: true }
              : { connect: { id: input.dependeDeOpcaoId } },
        }),
      });
    } catch (err) {
      if (ehP2002(err)) {
        throw new ConflictError('Já existe uma pergunta com essa ordem.');
      }
      throw err;
    }
  },

  async removerPergunta(id: number): Promise<void> {
    const rascunho = await garantirRascunho();
    await perguntaDoRascunho(id, rascunho.id);
    // Remove e renumera as restantes para 1..N (sem buracos na ordem).
    await prisma.$transaction(async (tx) => {
      await tx.pergunta.delete({ where: { id } });
      const restantes = await tx.pergunta.findMany({
        where: { questionarioVersaoId: rascunho.id },
        orderBy: { ordem: 'asc' },
        select: { id: true, ordem: true },
      });
      // Ascendente: cada nova ordem é <= a atual, então nunca colide com o índice único.
      let novaOrdem = 1;
      for (const p of restantes) {
        if (p.ordem !== novaOrdem) {
          await tx.pergunta.update({ where: { id: p.id }, data: { ordem: novaOrdem } });
        }
        novaOrdem += 1;
      }
    });
  },

  async criarOpcao(input: CriarOpcaoInput): Promise<void> {
    const rascunho = await garantirRascunho();
    await perguntaDoRascunho(input.perguntaId, rascunho.id);
    await opcaoRespostaRepository.criar({ perguntaId: input.perguntaId, texto: input.texto });
  },

  async atualizarOpcao(id: number, input: AtualizarOpcaoInput): Promise<void> {
    const rascunho = await garantirRascunho();
    await opcaoDoRascunho(id, rascunho.id);
    await opcaoRespostaRepository.atualizar(id, input.texto);
  },

  async removerOpcao(id: number): Promise<void> {
    const rascunho = await garantirRascunho();
    await opcaoDoRascunho(id, rascunho.id);
    await opcaoRespostaRepository.remover(id);
  },

  async definirPeso(input: DefinirPesoInput): Promise<void> {
    const rascunho = await garantirRascunho();
    await opcaoDoRascunho(input.opcaoId, rascunho.id);
    const tipo = await tipoPeleRepository.buscarPorId(input.tipoPeleId);
    if (!tipo) {
      throw new NotFoundError('Tipo de pele');
    }
    if (input.peso === 0) {
      // Peso 0 = sem contribuição: remove a linha para manter a tabela limpa.
      await prisma.pesoOpcaoPele.deleteMany({
        where: { opcaoId: input.opcaoId, tipoPeleId: input.tipoPeleId },
      });
      return;
    }
    await prisma.pesoOpcaoPele.upsert({
      where: { opcaoId_tipoPeleId: { opcaoId: input.opcaoId, tipoPeleId: input.tipoPeleId } },
      update: { peso: input.peso },
      create: { opcaoId: input.opcaoId, tipoPeleId: input.tipoPeleId, peso: input.peso },
    });
  },
};
