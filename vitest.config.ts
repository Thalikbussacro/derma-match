import { config } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Carrega as variáveis de teste (banco isolado) antes de qualquer teste rodar.
const testEnv = config({ path: '.env.test' }).parsed ?? {};

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    env: testEnv,
    setupFiles: ['./tests/setup.ts'],
    // Os arquivos compartilham o mesmo schema de teste; rodar em série evita corrida no truncate.
    fileParallelism: false,
  },
});
