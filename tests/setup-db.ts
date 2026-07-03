import { execSync } from 'node:child_process';
import { config } from 'dotenv';

// Prepara o banco de teste: aplica migrations e roda o seed no schema "test".
const parsed = config({ path: '.env.test' }).parsed;
if (!parsed?.DATABASE_URL) {
  console.error('Faltou o .env.test com DATABASE_URL. Veja o SETUP.md.');
  process.exit(1);
}

// Passa a DATABASE_URL de teste para os comandos do Prisma (dotenv do Prisma não sobrescreve).
const env = { ...process.env, ...parsed };

console.log('Preparando banco de teste (migrate deploy + seed)...');
execSync('pnpm exec prisma migrate deploy', { stdio: 'inherit', env });
execSync('pnpm exec prisma db seed', { stdio: 'inherit', env });
console.log('Banco de teste pronto.');
