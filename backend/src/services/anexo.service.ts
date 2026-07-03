import type { TipoUsuario } from '../services/token.service.js';
import { ForbiddenError, NotFoundError } from '../errors/http-error.js';
import { removerArquivo } from '../lib/uploads.js';
import { logger } from '../lib/logger.js';
import { anexoRepository } from '../repositories/anexo.repository.js';

interface Solicitante {
  tipoUsuario: TipoUsuario;
  id: number;
}

export const anexoService = {
  // Autoriza e retorna o caminho relativo do arquivo: só a dona da conversa ou a biomédica dela.
  async localizarParaDownload(
    anexoId: number,
    solicitante: Solicitante,
  ): Promise<{ caminhoRel: string; tipo: string }> {
    const anexo = await anexoRepository.buscarComConversa(anexoId);
    if (!anexo) {
      throw new NotFoundError('Anexo');
    }
    const conversa = anexo.mensagem.conversa;
    const permitido =
      (solicitante.tipoUsuario === 'USUARIA' && conversa.usuarioId === solicitante.id) ||
      (solicitante.tipoUsuario === 'BIOMEDICA' && conversa.biomedicaId === solicitante.id);
    if (!permitido) {
      throw new ForbiddenError('Acesso não permitido a este anexo.');
    }
    return { caminhoRel: anexo.caminho, tipo: anexo.tipo };
  },

  // Retenção LGPD: remove arquivos e registros de anexos vencidos (mantém as mensagens).
  async removerExpirados(): Promise<number> {
    const expirados = await anexoRepository.listarExpirados();
    let removidos = 0;
    for (const anexo of expirados) {
      // Falha em um anexo não deve abortar a limpeza dos demais.
      try {
        await removerArquivo(anexo.caminho);
        await anexoRepository.remover(anexo.id);
        removidos += 1;
      } catch (err) {
        logger.error({ err, anexoId: anexo.id }, 'falha ao remover anexo expirado');
      }
    }
    return removidos;
  },
};
