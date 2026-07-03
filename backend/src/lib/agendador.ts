import cron from 'node-cron';
import { anexoService } from '../services/anexo.service.js';
import { logger } from './logger.js';

export function iniciarAgendador(): void {
  // Diariamente às 3h: retenção LGPD de fotos (remove anexos vencidos do disco e do banco).
  cron.schedule('0 3 * * *', () => {
    void (async () => {
      try {
        const removidos = await anexoService.removerExpirados();
        if (removidos > 0) {
          logger.info(`retenção de anexos: ${removidos} removido(s).`);
        }
      } catch (err) {
        logger.error({ err }, 'falha na retenção de anexos');
      }
    })();
  });
}
