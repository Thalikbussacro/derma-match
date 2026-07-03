import cron from 'node-cron';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { anexoService } from '../services/anexo.service.js';
import { conversaService } from '../services/conversa.service.js';
import { logger } from './logger.js';

export function iniciarAgendador(): void {
  // Diariamente às 3h: retenção LGPD de fotos + conversas inativas + refresh tokens expirados.
  cron.schedule('0 3 * * *', () => {
    void (async () => {
      try {
        const anexos = await anexoService.removerExpirados();
        const conversas = await conversaService.removerInativas();
        const tokens = await refreshTokenRepository.removerExpirados();
        if (anexos > 0 || conversas > 0 || tokens > 0) {
          logger.info({ anexos, conversas, tokens }, 'limpeza agendada concluída');
        }
      } catch (err) {
        logger.error({ err }, 'falha na limpeza agendada');
      }
    })();
  });
}
