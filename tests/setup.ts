import { afterAll, beforeEach } from 'vitest';
import { prisma } from '../src/lib/prisma.js';

beforeEach(async () => {
  // Limpa tabelas de estado mutável entre testes. Tabelas de seed (tipos_pele) permanecem.
  await prisma.usuario.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});
