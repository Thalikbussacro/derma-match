import { NotFoundError, ValidationError } from '../errors/http-error.js';
import { opcaoRespostaRepository } from '../repositories/opcao-resposta.repository.js';
import { perguntaRepository } from '../repositories/pergunta.repository.js';
import { respostaUsuarioRepository } from '../repositories/resposta-usuario.repository.js';
import { tipoPeleRepository } from '../repositories/tipo-pele.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import type {
  EstadoQuestionarioResponse,
  PerguntaResponse,
  ResponderPerguntaInput,
} from '../schemas/questionario.schema.js';

async function obterEstado(usuarioId: number): Promise<EstadoQuestionarioResponse> {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError('Usuário');
  }

  const [perguntasRespondidas, totalPerguntas] = await Promise.all([
    respostaUsuarioRepository.contarPorUsuario(usuarioId),
    perguntaRepository.contar(),
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
  };
}

async function obterProximaPergunta(usuarioId: number): Promise<PerguntaResponse | null> {
  const perguntas = await perguntaRepository.listarOrdenadas();
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

async function finalizar(usuarioId: number): Promise<{ tipoPeleId: number; tipoPeleNome: string }> {
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

  const tipoPele = await tipoPeleRepository.buscarPorId(vencedorId);
  if (!tipoPele) {
    throw new NotFoundError('Tipo de pele');
  }

  await usuarioRepository.atualizarTipoPelePredominante(usuarioId, vencedorId);
  return { tipoPeleId: tipoPele.id, tipoPeleNome: tipoPele.nome };
}

export const questionarioService = {
  obterEstado,
  obterProximaPergunta,
  responder,
  refazer,
  finalizar,
};
