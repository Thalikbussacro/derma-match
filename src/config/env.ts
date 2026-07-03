import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Variáveis de ambiente inválidas. Verifique o .env:');
  for (const issue of parsed.error.issues) {
    const campo = issue.path.join('.') || '(raiz)';
    console.error(`  - ${campo}: ${issue.message}`);
  }
  process.exit(1);
}

export const env = parsed.data;
