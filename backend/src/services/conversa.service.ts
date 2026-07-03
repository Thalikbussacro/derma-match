import type { Conversa } from '@prisma/client';
import type { ConversaResponse, MensagemResponse } from '@derma-match/shared';
import { ForbiddenError, NotFoundError } from '../errors/http-error.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';
import { conversaRepository } from '../repositories/conversa.repository.js';
import type { MensagemComAnexos } from '../repositories/mensagem.repository.js';
import { mensagemRepository } from '../repositories/mensagem.repository.js';
import { usuarioRepository } from '../repositories/usuario.repository.js';

function conversaResponse(conversa: Conversa, biomedicaNome: string): ConversaResponse {
  return {
    id: conversa.id,
    biomedicaNome,
    ultimaAtividade: conversa.ultimaAtividade.toISOString(),
  };
}

function mensagemResponse(m: MensagemComAnexos): MensagemResponse {
  return {
    id: m.id,
    autorTipo: m.autorTipo,
    conteudo: m.conteudo,
    criadoEm: m.criadoEm.toISOString(),
    anexos: m.anexos.map((a) => ({ id: a.id, tipo: a.tipo })),
  };
}

// Só usuária PREMIUM tem conversa; obtém a existente ou cria (associada à biomédica única).
async function obterOuCriarConversa(
  usuarioId: number,
): Promise<{ conversa: Conversa; biomedicaNome: string }> {
  const usuario = await usuarioRepository.buscarPorId(usuarioId);
  if (!usuario) {
    throw new NotFoundError('Usuário');
  }
  if (usuario.plano !== 'PREMIUM') {
    throw new ForbiddenError('Recurso exclusivo do plano Premium.', 'PLANO_INSUFICIENTE');
  }
  const biomedica = await biomedicaRepository.buscarAtiva();
  if (!biomedica) {
    throw new NotFoundError('Biomédica');
  }
  let conversa = await conversaRepository.buscarDoUsuario(usuarioId);
  conversa ??= await conversaRepository.criar(usuarioId, biomedica.id);
  return { conversa, biomedicaNome: biomedica.nome };
}

export const conversaService = {
  async iniciar(usuarioId: number): Promise<ConversaResponse> {
    const { conversa, biomedicaNome } = await obterOuCriarConversa(usuarioId);
    return conversaResponse(conversa, biomedicaNome);
  },

  async obter(usuarioId: number): Promise<ConversaResponse | null> {
    const conversa = await conversaRepository.buscarDoUsuario(usuarioId);
    if (!conversa) {
      return null;
    }
    const biomedica = await biomedicaRepository.buscarPorId(conversa.biomedicaId);
    return conversaResponse(conversa, biomedica?.nome ?? 'Biomédica');
  },

  async enviarMensagem(usuarioId: number, conteudo: string): Promise<MensagemResponse> {
    const { conversa } = await obterOuCriarConversa(usuarioId);
    const mensagem = await mensagemRepository.criar({
      conversaId: conversa.id,
      autorTipo: 'USUARIA',
      autorId: usuarioId,
      conteudo,
    });
    await conversaRepository.atualizarUltimaAtividade(conversa.id);
    return mensagemResponse({ ...mensagem, anexos: [] });
  },

  async listarMensagens(usuarioId: number): Promise<MensagemResponse[]> {
    const conversa = await conversaRepository.buscarDoUsuario(usuarioId);
    if (!conversa) {
      return [];
    }
    const mensagens = await mensagemRepository.listarPorConversa(conversa.id);
    return mensagens.map(mensagemResponse);
  },
};
