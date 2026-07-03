import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { conversaService } from '../services/conversa.service.js';

// Retenção LGPD de conversas inativas (>12 meses). Rodável de forma agendada. Ver ADR-0014.
async function main(): Promise<void> {
  const removidas = await conversaService.removerInativas();
  console.log(`retenção de conversas: ${removidas} removida(s).`);
}

main()
  .catch((erro: unknown) => {
    console.error('falha na retenção de conversas:', erro);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
