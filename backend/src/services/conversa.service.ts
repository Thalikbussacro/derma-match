import type { Conversa } from '@prisma/client';
import type { ConversaResponse, MensagemResponse } from '@derma-match/shared';
import { ForbiddenError, NotFoundError } from '../errors/http-error.js';
import { prisma } from '../lib/prisma.js';
import { biomedicaRepository } from '../repositories/biomedica.repository.js';

// Retenção LGPD: fotos expiram 90 dias após o envio (ADR-0011).
const RETENCAO_ANEXO_MS = 90 * 24 * 60 * 60 * 1000;
// Conversas inativas há mais de 12 meses são removidas (ADR-0014).
const RETENCAO_CONVERSA_MS = 365 * 24 * 60 * 60 * 1000;
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

export function mensagemResponse(m: MensagemComAnexos): MensagemResponse {
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
  if (!conversa) {
    try {
      conversa = await conversaRepository.criar(usuarioId, biomedica.id);
    } catch (err) {
      // Corrida (violação do unique usuário+biomédica): reaproveita a conversa criada em paralelo.
      conversa = await conversaRepository.buscarDoUsuario(usuarioId);
      if (!conversa) {
        throw err;
      }
    }
  }
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

  async enviarMensagem(
    usuarioId: number,
    conteudo: string,
    foto?: { caminhoRel: string; tipo: string },
  ): Promise<MensagemResponse> {
    const { conversa } = await obterOuCriarConversa(usuarioId);
    // Mensagem + anexo + atualização de atividade em uma transação (tudo ou nada).
    const mensagem = await prisma.$transaction(async (tx) => {
      const criada = await tx.mensagem.create({
        data: { conversaId: conversa.id, autorTipo: 'USUARIA', autorId: usuarioId, conteudo },
      });
      if (foto) {
        await tx.anexo.create({
          data: {
            mensagemId: criada.id,
            tipo: foto.tipo,
            caminho: foto.caminhoRel,
            dataExpiracao: new Date(Date.now() + RETENCAO_ANEXO_MS),
          },
        });
      }
      await tx.conversa.update({ where: { id: conversa.id }, data: { ultimaAtividade: new Date() } });
      return tx.mensagem.findUniqueOrThrow({ where: { id: criada.id }, include: { anexos: true } });
    });
    return mensagemResponse(mensagem);
  },

  async listarMensagens(usuarioId: number): Promise<MensagemResponse[]> {
    const conversa = await conversaRepository.buscarDoUsuario(usuarioId);
    if (!conversa) {
      return [];
    }
    const mensagens = await mensagemRepository.listarPorConversa(conversa.id);
    return mensagens.map(mensagemResponse);
  },

  // Retenção LGPD: remove conversas (e suas mensagens) inativas há mais de 12 meses.
  async removerInativas(): Promise<number> {
    const cutoff = new Date(Date.now() - RETENCAO_CONVERSA_MS);
    return conversaRepository.removerInativas(cutoff);
  },
};
