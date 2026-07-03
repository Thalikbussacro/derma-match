import type {
  ContextoClinicoResponse,
  ConversaBiomedicaResponse,
  MensagemResponse,
} from '@derma-match/shared';
import type { Conversa } from '@prisma/client';
import { NotFoundError } from '../errors/http-error.js';
import { conversaRepository } from '../repositories/conversa.repository.js';
import { mensagemRepository } from '../repositories/mensagem.repository.js';
import { respostaUsuarioRepository } from '../repositories/resposta-usuario.repository.js';
import { tipoPeleRepository } from '../repositories/tipo-pele.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';
import { mensagemResponse } from './conversa.service.js';

// Biomédica só acessa conversas dela; conversa alheia é tratada como inexistente (RNF-LGPD-005).
async function garantirConversa(conversaId: number, biomedicaId: number): Promise<Conversa> {
  const conversa = await conversaRepository.buscarDaBiomedica(conversaId, biomedicaId);
  if (!conversa) {
    throw new NotFoundError('Conversa');
  }
  return conversa;
}

export const biomedicaConversaService = {
  async listar(biomedicaId: number): Promise<ConversaBiomedicaResponse[]> {
    const conversas = await conversaRepository.listarDaBiomedica(biomedicaId);
    return conversas.map((c) => {
      const ultima = c.mensagens[0];
      return {
        id: c.id,
        usuarioNome: c.usuario.nome,
        ultimaMensagem: ultima ? ultima.conteudo.slice(0, 80) : '',
        ultimaAtividade: c.ultimaAtividade.toISOString(),
        naoRespondida: ultima?.autorTipo === 'USUARIA',
      };
    });
  },

  async listarMensagens(biomedicaId: number, conversaId: number): Promise<MensagemResponse[]> {
    await garantirConversa(conversaId, biomedicaId);
    const mensagens = await mensagemRepository.listarPorConversa(conversaId);
    return mensagens.map(mensagemResponse);
  },

  async responder(
    biomedicaId: number,
    conversaId: number,
    conteudo: string,
  ): Promise<MensagemResponse> {
    await garantirConversa(conversaId, biomedicaId);
    const mensagem = await mensagemRepository.criar({
      conversaId,
      autorTipo: 'BIOMEDICA',
      autorId: biomedicaId,
      conteudo,
    });
    await conversaRepository.atualizarUltimaAtividade(conversaId);
    return mensagemResponse({ ...mensagem, anexos: [] });
  },

  // Contexto clínico mínimo: nome, tipo de pele e respostas do questionário. Sem email/assinatura.
  async contexto(biomedicaId: number, conversaId: number): Promise<ContextoClinicoResponse> {
    const conversa = await garantirConversa(conversaId, biomedicaId);
    const usuario = await usuarioRepository.buscarPorId(conversa.usuarioId);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }
    const tipoPele = usuario.tipoPelePredominanteId
      ? await tipoPeleRepository.buscarPorId(usuario.tipoPelePredominanteId)
      : null;
    const respostas = await respostaUsuarioRepository.listarComContexto(usuario.id);
    return {
      usuarioNome: usuario.nome,
      tipoPeleNome: tipoPele?.nome ?? null,
      respostas: respostas.map((r) => ({ pergunta: r.pergunta.texto, resposta: r.opcao.texto })),
    };
  },
};
