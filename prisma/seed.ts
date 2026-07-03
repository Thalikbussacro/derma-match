import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type TipoNome = 'oleosa' | 'seca' | 'mista' | 'normal' | 'sensivel';

// Ordem importante: define os ids (1..5) e, com isso, o critério de desempate
// (menor id) no cálculo do tipo de pele predominante. Ver database.md / RF-QUEST-011.
const tiposPele: { nome: TipoNome; descricao: string }[] = [
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

// Conteúdo do questionário. `chave` identifica a opção para que perguntas condicionais
// possam depender dela. `dependeDe` referencia a chave de uma opção de pergunta ANTERIOR.
interface OpcaoDef {
  chave: string;
  texto: string;
  pesos: Partial<Record<TipoNome, number>>;
}
interface PerguntaDef {
  texto: string;
  ordem: number;
  dependeDe?: string;
  opcoes: OpcaoDef[];
}

const perguntas: PerguntaDef[] = [
  {
    texto: 'Como sua pele costuma ficar no fim do dia?',
    ordem: 1,
    opcoes: [
      { chave: 'q1_brilhosa', texto: 'Brilhosa e oleosa no rosto todo', pesos: { oleosa: 3, mista: 1 } },
      { chave: 'q1_repuxada', texto: 'Repuxada e ressecada', pesos: { seca: 3 } },
      { chave: 'q1_mista', texto: 'Oleosa na zona T e normal/seca nas bochechas', pesos: { mista: 3 } },
      { chave: 'q1_confortavel', texto: 'Confortável, sem brilho nem repuxamento', pesos: { normal: 3 } },
      { chave: 'q1_sensivel', texto: 'Com vermelhidão ou ardência', pesos: { sensivel: 3 } },
    ],
  },
  {
    texto: 'Com que frequência sua pele apresenta oleosidade/brilho?',
    ordem: 2,
    opcoes: [
      { chave: 'q2_diatodo', texto: 'O dia todo', pesos: { oleosa: 3, mista: 1 } },
      { chave: 'q2_zonat', texto: 'Só na zona T', pesos: { mista: 3 } },
      { chave: 'q2_raro', texto: 'Raramente', pesos: { seca: 2, normal: 1 } },
      { chave: 'q2_nunca', texto: 'Quase nunca, minha pele é mais seca', pesos: { seca: 3 } },
    ],
  },
  {
    texto: 'Como estão os seus poros?',
    ordem: 3,
    opcoes: [
      { chave: 'q3_dilatados', texto: 'Dilatados e visíveis', pesos: { oleosa: 3, mista: 1 } },
      { chave: 'q3_zonat', texto: 'Visíveis só na zona T', pesos: { mista: 2 } },
      { chave: 'q3_pouco', texto: 'Pouco visíveis', pesos: { seca: 2, normal: 1 } },
      { chave: 'q3_normais', texto: 'Normais', pesos: { normal: 2 } },
    ],
  },
  {
    texto: 'Sua pele reage a novos produtos com irritação ou vermelhidão?',
    ordem: 4,
    opcoes: [
      { chave: 'q4_sim', texto: 'Sim, frequentemente', pesos: { sensivel: 3 } },
      { chave: 'q4_asvezes', texto: 'Às vezes', pesos: { sensivel: 1, normal: 1 } },
      { chave: 'q4_raro', texto: 'Raramente', pesos: { normal: 1 } },
      { chave: 'q4_nunca', texto: 'Nunca', pesos: { oleosa: 1, normal: 1 } },
    ],
  },
  {
    texto: 'Você sente repuxamento logo após lavar o rosto?',
    ordem: 5,
    opcoes: [
      { chave: 'q5_sempre', texto: 'Sim, sempre', pesos: { seca: 3, sensivel: 1 } },
      { chave: 'q5_asvezes', texto: 'Às vezes', pesos: { seca: 1, mista: 1 } },
      { chave: 'q5_nao', texto: 'Não', pesos: { oleosa: 2, normal: 1 } },
    ],
  },
  {
    texto: 'Com que frequência surgem espinhas ou cravos?',
    ordem: 6,
    opcoes: [
      { chave: 'q6_frequente', texto: 'Frequentemente', pesos: { oleosa: 3, mista: 1 } },
      { chave: 'q6_zonat', texto: 'Ocasionalmente, na zona T', pesos: { mista: 2 } },
      { chave: 'q6_raro', texto: 'Raramente', pesos: { normal: 1, seca: 1 } },
    ],
  },
  {
    texto: 'Sua pele descama ou tem áreas ásperas?',
    ordem: 7,
    opcoes: [
      { chave: 'q7_sim', texto: 'Sim, com frequência', pesos: { seca: 3 } },
      { chave: 'q7_areas', texto: 'Em algumas áreas', pesos: { seca: 1, mista: 1 } },
      { chave: 'q7_nao', texto: 'Não', pesos: { oleosa: 1, normal: 1 } },
    ],
  },
  {
    texto: 'Como sua pele reage ao sol e ao calor?',
    ordem: 8,
    opcoes: [
      { chave: 'q8_oleosa', texto: 'Fica mais oleosa', pesos: { oleosa: 2, mista: 1 } },
      { chave: 'q8_vermelha', texto: 'Fica vermelha ou irritada', pesos: { sensivel: 3 } },
      { chave: 'q8_resseca', texto: 'Resseca', pesos: { seca: 2 } },
      { chave: 'q8_normal', texto: 'Sem grande mudança', pesos: { normal: 2 } },
    ],
  },
  // Condicional: só aparece se a pele foi indicada como reativa na pergunta 4.
  {
    texto: 'Você tem diagnóstico ou suspeita de pele sensível (ex.: rosácea, dermatite)?',
    ordem: 9,
    dependeDe: 'q4_sim',
    opcoes: [
      { chave: 'q9_sim', texto: 'Sim', pesos: { sensivel: 3 } },
      { chave: 'q9_naosei', texto: 'Não sei', pesos: { sensivel: 1 } },
    ],
  },
  // Condicional: só aparece se a pele foi indicada como mista na pergunta 1.
  {
    texto: 'Na sua zona T, a oleosidade é intensa?',
    ordem: 10,
    dependeDe: 'q1_mista',
    opcoes: [
      { chave: 'q10_intensa', texto: 'Muito intensa', pesos: { mista: 2, oleosa: 1 } },
      { chave: 'q10_moderada', texto: 'Moderada', pesos: { mista: 2 } },
    ],
  },
];

async function seedTiposPele(): Promise<Map<TipoNome, number>> {
  for (const tipo of tiposPele) {
    await prisma.tipoPele.upsert({
      where: { nome: tipo.nome },
      update: { descricao: tipo.descricao },
      create: tipo,
    });
  }
  const registros = await prisma.tipoPele.findMany();
  const mapa = new Map<TipoNome, number>();
  for (const t of registros) {
    mapa.set(t.nome as TipoNome, t.id);
  }
  return mapa;
}

async function seedQuestionario(tiposPeleIds: Map<TipoNome, number>): Promise<void> {
  // Apagar e recriar (aceitável em seed). O cascade remove opções, pesos e respostas.
  await prisma.pergunta.deleteMany();

  const opcaoIdPorChave = new Map<string, number>();

  for (const perguntaDef of perguntas) {
    let dependeDeOpcaoId: number | null = null;
    if (perguntaDef.dependeDe !== undefined) {
      const id = opcaoIdPorChave.get(perguntaDef.dependeDe);
      if (id === undefined) {
        throw new Error(
          `Pergunta "${perguntaDef.texto}" depende da opção "${perguntaDef.dependeDe}", ` +
            'que não pertence a uma pergunta anterior.',
        );
      }
      dependeDeOpcaoId = id;
    }

    const pergunta = await prisma.pergunta.create({
      data: { texto: perguntaDef.texto, ordem: perguntaDef.ordem, dependeDeOpcaoId },
    });

    for (const opcaoDef of perguntaDef.opcoes) {
      const opcao = await prisma.opcaoResposta.create({
        data: { perguntaId: pergunta.id, texto: opcaoDef.texto },
      });
      opcaoIdPorChave.set(opcaoDef.chave, opcao.id);

      for (const [nome, peso] of Object.entries(opcaoDef.pesos)) {
        if (peso === undefined) {
          continue;
        }
        if (peso < 0) {
          throw new Error(`Peso negativo (${peso}) na opção "${opcaoDef.texto}" para "${nome}".`);
        }
        const tipoPeleId = tiposPeleIds.get(nome as TipoNome);
        if (tipoPeleId === undefined) {
          throw new Error(`Tipo de pele "${nome}" não existe (opção "${opcaoDef.texto}").`);
        }
        await prisma.pesoOpcaoPele.create({
          data: { opcaoId: opcao.id, tipoPeleId, peso },
        });
      }
    }
  }
}

async function main(): Promise<void> {
  const tiposPeleIds = await seedTiposPele();
  await seedQuestionario(tiposPeleIds);
}

try {
  await main();
  console.log(`seed concluído: ${tiposPele.length} tipos de pele, ${perguntas.length} perguntas.`);
} catch (err) {
  console.error('falha no seed:', err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
