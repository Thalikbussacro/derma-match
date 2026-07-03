import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js';

// Remove refresh tokens já expirados (inclui os revogados, que expiram em até 7 dias).
// Feito para rodar de forma agendada (cron / agendador de tarefas) em produção. Ver ADR-0004.
async function main(): Promise<void> {
  const removidos = await refreshTokenRepository.removerExpirados();
  console.log(`limpeza de refresh tokens: ${removidos} removido(s).`);
}

main()
  .catch((erro: unknown) => {
    console.error('falha na limpeza de refresh tokens:', erro);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
