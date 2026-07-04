import type { Usuario } from '@prisma/client';
import { NotFoundError, ValidationError } from '../errors/http-error.js';
import { opcaoRespostaRepository } from '../repositories/opcao-resposta.repository.js';
import { perguntaRepository } from '../repositories/pergunta.repository.js';
import { questionarioVersaoRepository } from '../repositories/questionario-versao.repository.js';
import { respostaUsuarioRepository } from '../repositories/resposta-usuario.repository.js';
import { tipoPeleRepository } from '../repositories/tipo-pele.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import type {
  EstadoQuestionarioResponse,
  PerguntaResponse,
  ResponderPerguntaInput,
} from '../schemas/questionario.schema.js';

// Versão que a usuária está respondendo: a fixada na sessão dela, ou a publicada (se ainda não começou).
async function versaoAtivaId(usuario: Usuario): Promise<number> {
  if (usuario.questionarioVersaoId !== null) {
    return usuario.questionarioVersaoId;
  }
  const publicada = await questionarioVersaoRepository.buscarPublicada();
  if (!publicada) {
    throw new NotFoundError('Questionário publicado');
  }
  return publicada.id;
}

async function obterEstado(usuarioId: number): Promise<EstadoQuestionarioResponse> {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError('Usuário');
  }
  const versaoId = await versaoAtivaId(usuario);

  const [perguntasRespondidas, totalPerguntas] = await Promise.all([
    respostaUsuarioRepository.contarPorUsuario(usuarioId),
    perguntaRepository.contar(versaoId),
  ]);

  let estado: EstadoQuestionarioResponse['estado'];
  if (usuario.tipoPelePredominanteId !== null) {
    estado = 'CONCLUIDO';
  } else if (perguntasRespondidas === 0) {
    estado = 'NAO_INICIADO';
  } else {
    estado = 'EM_ANDAMENTO';
  }

  return {
    estado,
    perguntasRespondidas,
    totalPerguntas,
    tipoPeleId: usuario.tipoPelePredominanteId,
    tipoPeleNivel: usuario.tipoPeleNivel,
  };
}

async function obterProximaPergunta(usuarioId: number): Promise<PerguntaResponse | null> {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError('Usuário');
  }
  const versaoId = await versaoAtivaId(usuario);
  const perguntas = await perguntaRepository.listarOrdenadas(versaoId);
  const respostas = await respostaUsuarioRepository.listarPorUsuario(usuarioId);

  const perguntasRespondidas = new Set(respostas.map((r) => r.perguntaId));
  const opcoesEscolhidas = new Set(respostas.map((r) => r.opcaoId));

  for (const pergunta of perguntas) {
    if (perguntasRespondidas.has(pergunta.id)) {
      continue;
    }
    // Se depende de uma opção, ela precisa ter sido escolhida pelo usuário.
    if (pergunta.dependeDeOpcaoId !== null && !opcoesEscolhidas.has(pergunta.dependeDeOpcaoId)) {
      continue;
    }
    return {
      id: pergunta.id,
      texto: pergunta.texto,
      ordem: pergunta.ordem,
      opcoes: pergunta.opcoes.map((o) => ({ id: o.id, texto: o.texto })),
    };
  }

  return null;
}

async function responder(usuarioId: number, input: ResponderPerguntaInput): Promise<void> {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError('Usuário');
  }

  // Fixa a versão na primeira resposta: a sessão fica presa à versão iniciada, mesmo que uma nova
  // seja publicada no meio (não corrompe o cálculo). Ver ADR-0016.
  if (usuario.questionarioVersaoId === null) {
    const publicada = await questionarioVersaoRepository.buscarPublicada();
    if (!publicada) {
      throw new NotFoundError('Questionário publicado');
    }
    await usuarioRepository.atualizar(usuarioId, {
      questionarioVersao: { connect: { id: publicada.id } },
    });
  }

  const opcao = await opcaoRespostaRepository.buscarPorId(input.opcaoId);
  if (!opcao) {
    throw new NotFoundError('Opção de resposta');
  }
  if (opcao.perguntaId !== input.perguntaId) {
    throw new ValidationError('A opção não pertence à pergunta informada.', 'OPCAO_INVALIDA');
  }

  // A pergunta respondida precisa ser a "próxima esperada": impede resposta fora de ordem ou de
  // pergunta que deveria ter sido pulada por dependência não satisfeita.
  const proxima = await obterProximaPergunta(usuarioId);
  if (proxima === null || proxima.id !== input.perguntaId) {
    throw new ValidationError(
      'Esta não é a próxima pergunta do questionário.',
      'PERGUNTA_FORA_DE_ORDEM',
    );
  }

  await respostaUsuarioRepository.upsert(usuarioId, input.perguntaId, input.opcaoId);
}

async function refazer(usuarioId: number): Promise<void> {
  await respostaUsuarioRepository.refazerQuestionario(usuarioId);
  // Ao refazer, a usuária passa a responder a versão publicada atual.
  const publicada = await questionarioVersaoRepository.buscarPublicada();
  if (publicada) {
    await usuarioRepository.atualizar(usuarioId, {
      questionarioVersao: { connect: { id: publicada.id } },
    });
  }
}

// Vencedor: maior soma de pesos. Empate resolvido pelo menor tipoPeleId (RF-QUEST-011).
export function determinarTipoPeleVencedor(somaPorTipo: Map<number, number>): number | null {
  let vencedorId: number | null = null;
  let maiorSoma = -1;
  for (const [tipoPeleId, soma] of [...somaPorTipo.entries()].sort((a, b) => a[0] - b[0])) {
    if (soma > maiorSoma) {
      maiorSoma = soma;
      vencedorId = tipoPeleId;
    }
  }
  return vencedorId;
}

// Nível 1–5 dentro do tipo vencedor: inclinação rumo ao tipo vizinho no espectro (ADR-0016 / C3).
// lean = clamp((S_prox − S_ant) / max(S_venc, 1), −1, 1); nível = round(3 + 2·lean).
export function calcularNivel(
  vencedor: { id: number; ordem: number },
  tipos: { id: number; ordem: number }[],
  somaPorTipo: Map<number, number>,
): number {
  const scoreDaOrdem = (ordem: number): number => {
    const tipo = tipos.find((t) => t.ordem === ordem);
    return tipo ? (somaPorTipo.get(tipo.id) ?? 0) : 0;
  };
  const sVenc = somaPorTipo.get(vencedor.id) ?? 0;
  const sAnt = scoreDaOrdem(vencedor.ordem - 1);
  const sProx = scoreDaOrdem(vencedor.ordem + 1);
  const lean = Math.max(-1, Math.min(1, (sProx - sAnt) / Math.max(sVenc, 1)));
  return Math.max(1, Math.min(5, Math.round(3 + 2 * lean)));
}

async function finalizar(
  usuarioId: number,
): Promise<{ tipoPeleId: number; tipoPeleNome: string; nivel: number }> {
  const proxima = await obterProximaPergunta(usuarioId);
  if (proxima !== null) {
    throw new ValidationError('O questionário ainda não foi concluído.', 'QUESTIONARIO_INCOMPLETO');
  }

  const respostas = await respostaUsuarioRepository.listarPorUsuario(usuarioId);
  const somaPorTipo = new Map<number, number>();
  for (const resposta of respostas) {
    for (const peso of resposta.opcao.pesos) {
      somaPorTipo.set(peso.tipoPeleId, (somaPorTipo.get(peso.tipoPeleId) ?? 0) + peso.peso);
    }
  }

  const vencedorId = determinarTipoPeleVencedor(somaPorTipo);
  if (vencedorId === null) {
    throw new ValidationError(
      'Não há respostas suficientes para calcular o tipo de pele.',
      'QUESTIONARIO_INCOMPLETO',
    );
  }

  const tipos = await tipoPeleRepository.listar();
  const vencedor = tipos.find((t) => t.id === vencedorId);
  if (!vencedor) {
    throw new NotFoundError('Tipo de pele');
  }
  const nivel = calcularNivel(vencedor, tipos, somaPorTipo);

  await usuarioRepository.atualizarResultado(usuarioId, vencedorId, nivel);
  return { tipoPeleId: vencedor.id, tipoPeleNome: vencedor.nome, nivel };
}

export const questionarioService = {
  obterEstado,
  obterProximaPergunta,
  responder,
  refazer,
  finalizar,
};
