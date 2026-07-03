import 'dotenv/config';
import { prisma } from '../lib/prisma.js';
import { anexoService } from '../services/anexo.service.js';

// Retenção LGPD de fotos, também rodável de forma agendada. Ver ADR-0011.
async function main(): Promise<void> {
  const removidos = await anexoService.removerExpirados();
  console.log(`retenção de anexos: ${removidos} removido(s).`);
}

main()
  .catch((erro: unknown) => {
    console.error('falha na retenção de anexos:', erro);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
