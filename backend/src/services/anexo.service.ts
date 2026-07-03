import type { TipoUsuario } from '../services/token.service.js';
import { ForbiddenError, NotFoundError } from '../errors/http-error.js';
import { caminhoAbsoluto, removerArquivo } from '../lib/uploads.js';
import { anexoRepository } from '../repositories/anexo.repository.js';

interface Solicitante {
  tipoUsuario: TipoUsuario;
  id: number;
}

export const anexoService = {
  // Autoriza e localiza o arquivo: só a dona da conversa ou a biomédica da conversa.
  async localizarParaDownload(
    anexoId: number,
    solicitante: Solicitante,
  ): Promise<{ caminhoAbs: string; tipo: string }> {
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
    return { caminhoAbs: caminhoAbsoluto(anexo.caminho), tipo: anexo.tipo };
  },

  // Retenção LGPD: remove arquivos e registros de anexos vencidos (mantém as mensagens).
  async removerExpirados(): Promise<number> {
    const expirados = await anexoRepository.listarExpirados();
    for (const anexo of expirados) {
      await removerArquivo(anexo.caminho);
      await anexoRepository.remover(anexo.id);
    }
    return expirados.length;
  },
};
