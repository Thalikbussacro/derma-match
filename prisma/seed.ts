import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ordem importante: define os ids (1..5) e, com isso, o critério de desempate
// (menor id) no cálculo do tipo de pele predominante. Ver database.md / RF-QUEST-011.
const tiposPele = [
  {
    nome: 'oleosa',
    descricao:
      'Produção elevada de sebo, com brilho constante e tendência a poros dilatados e acne.',
  },
  {
    nome: 'seca',
    descricao: 'Baixa produção de sebo, com sensação de repuxamento e tendência a descamação.',
  },
  {
    nome: 'mista',
    descricao: 'Oleosa na zona T (testa, nariz e queixo) e normal a seca nas bochechas.',
  },
  {
    nome: 'normal',
    descricao: 'Equilibrada, sem excesso de oleosidade nem ressecamento, com textura uniforme.',
  },
  {
    nome: 'sensivel',
    descricao: 'Reativa, propensa a vermelhidão, ardência e irritação com facilidade.',
  },
];

async function main() {
  for (const tipo of tiposPele) {
    await prisma.tipoPele.upsert({
      where: { nome: tipo.nome },
      update: { descricao: tipo.descricao },
      create: tipo,
    });
  }
}

try {
  await main();
  console.log(`seed concluído: ${tiposPele.length} tipos de pele.`);
} catch (err) {
  console.error('falha no seed:', err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
