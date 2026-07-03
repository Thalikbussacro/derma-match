import cron from 'node-cron';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';
import { anexoService } from '../services/anexo.service.js';
import { logger } from './logger.js';

export function iniciarAgendador(): void {
  // Diariamente às 3h: retenção LGPD de fotos + limpeza de refresh tokens expirados.
  cron.schedule('0 3 * * *', () => {
    void (async () => {
      try {
        const anexos = await anexoService.removerExpirados();
        const tokens = await refreshTokenRepository.removerExpirados();
        if (anexos > 0 || tokens > 0) {
          logger.info({ anexos, tokens }, 'limpeza agendada concluída');
        }
      } catch (err) {
        logger.error({ err }, 'falha na limpeza agendada');
      }
    })();
  });
}
