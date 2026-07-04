import { PrismaClient } from '@prisma/client';
import type { EtapaRotina } from '@prisma/client';
import bcrypt from 'bcrypt';

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
      {
        chave: 'q1_brilhosa',
        texto: 'Brilhosa e oleosa no rosto todo',
        pesos: { oleosa: 3, mista: 1 },
      },
      { chave: 'q1_repuxada', texto: 'Repuxada e ressecada', pesos: { seca: 3 } },
      {
        chave: 'q1_mista',
        texto: 'Oleosa na zona T e normal/seca nas bochechas',
        pesos: { mista: 3 },
      },
      {
        chave: 'q1_confortavel',
        texto: 'Confortável, sem brilho nem repuxamento',
        pesos: { normal: 3 },
      },
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

// Rotinas por tipo de pele (seed data). Conteúdo plausível, não é orientação dermatológica real.
interface ItemRotinaDef {
  etapa: EtapaRotina;
  descricao: string;
  ordem: number;
}
interface RotinaDef {
  tipo: TipoNome;
  descricao: string;
  itens: ItemRotinaDef[];
}

const rotinas: RotinaDef[] = [
  {
    tipo: 'oleosa',
    descricao: 'Rotina focada em controle de oleosidade e desobstrução dos poros.',
    itens: [
      {
        etapa: 'LIMPEZA',
        descricao: 'Gel de limpeza com ácido salicílico, de manhã e à noite.',
        ordem: 1,
      },
      { etapa: 'TONIFICACAO', descricao: 'Tônico adstringente sem álcool.', ordem: 2 },
      {
        etapa: 'TRATAMENTO',
        descricao: 'Sérum de niacinamida para controlar a oleosidade.',
        ordem: 3,
      },
      { etapa: 'HIDRATACAO', descricao: 'Hidratante oil-free em gel.', ordem: 4 },
      { etapa: 'PROTECAO_SOLAR', descricao: 'Protetor solar toque seco FPS 30 ou mais.', ordem: 5 },
    ],
  },
  {
    tipo: 'seca',
    descricao: 'Rotina focada em hidratação intensa e reforço da barreira da pele.',
    itens: [
      { etapa: 'LIMPEZA', descricao: 'Loção de limpeza suave, sem sabonete.', ordem: 1 },
      {
        etapa: 'TRATAMENTO',
        descricao: 'Sérum de ácido hialurônico antes do hidratante.',
        ordem: 2,
      },
      { etapa: 'HIDRATACAO', descricao: 'Hidratante rico com ceramidas.', ordem: 3 },
      { etapa: 'PROTECAO_SOLAR', descricao: 'Protetor solar hidratante FPS 30 ou mais.', ordem: 4 },
    ],
  },
  {
    tipo: 'mista',
    descricao: 'Rotina equilibrada: controla a zona T sem ressecar as bochechas.',
    itens: [
      { etapa: 'LIMPEZA', descricao: 'Gel de limpeza suave.', ordem: 1 },
      { etapa: 'TONIFICACAO', descricao: 'Tônico equilibrante, com foco na zona T.', ordem: 2 },
      { etapa: 'HIDRATACAO', descricao: 'Hidratante leve, reforçado nas bochechas.', ordem: 3 },
      {
        etapa: 'PROTECAO_SOLAR',
        descricao: 'Protetor solar FPS 30 ou mais de textura leve.',
        ordem: 4,
      },
    ],
  },
  {
    tipo: 'normal',
    descricao: 'Rotina de manutenção para pele equilibrada.',
    itens: [
      { etapa: 'LIMPEZA', descricao: 'Sabonete facial suave.', ordem: 1 },
      { etapa: 'HIDRATACAO', descricao: 'Hidratante leve diário.', ordem: 2 },
      { etapa: 'PROTECAO_SOLAR', descricao: 'Protetor solar FPS 30 ou mais.', ordem: 3 },
    ],
  },
  {
    tipo: 'sensivel',
    descricao: 'Rotina suave, com produtos calmantes e sem fragrância.',
    itens: [
      { etapa: 'LIMPEZA', descricao: 'Água micelar suave, sem esfregar.', ordem: 1 },
      {
        etapa: 'TRATAMENTO',
        descricao: 'Sérum calmante com niacinamida em baixa concentração.',
        ordem: 2,
      },
      {
        etapa: 'HIDRATACAO',
        descricao: 'Hidratante calmante com pantenol, sem fragrância.',
        ordem: 3,
      },
      {
        etapa: 'PROTECAO_SOLAR',
        descricao: 'Protetor solar mineral FPS 30 ou mais para peles sensíveis.',
        ordem: 4,
      },
    ],
  },
];

// Posição no espectro (do mais seco ao mais oleoso; sensível ao fim). Ajustável no admin (C3).
const ordemPorTipo: Record<TipoNome, number> = {
  seca: 1,
  normal: 2,
  mista: 3,
  oleosa: 4,
  sensivel: 5,
};

async function seedTiposPele(): Promise<Map<TipoNome, number>> {
  for (const tipo of tiposPele) {
    await prisma.tipoPele.upsert({
      where: { nome: tipo.nome },
      update: { descricao: tipo.descricao, ordem: ordemPorTipo[tipo.nome] },
      create: { ...tipo, ordem: ordemPorTipo[tipo.nome] },
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
  // Versão 1 publicada — dona do conteúdo do seed (ADR-0016).
  const versao = await prisma.questionarioVersao.upsert({
    where: { numero: 1 },
    update: { status: 'PUBLICADO' },
    create: { numero: 1, status: 'PUBLICADO', publicadoEm: new Date() },
  });
  // Reset: a v1 é a única publicada (seed é ferramenta de dev/reset). Arquiva as demais.
  await prisma.questionarioVersao.updateMany({
    where: { numero: { not: 1 } },
    data: { status: 'ARQUIVADO' },
  });
  // Apagar e recriar (aceitável em seed). O cascade remove opções, pesos e respostas.
  await prisma.pergunta.deleteMany();

  const opcaoIdPorChave = new Map<string, number>();

  // Processa por `ordem` (não por posição no array): garante que uma dependência só resolve para
  // uma opção de pergunta com `ordem` menor — mesmo contrato usado na navegação.
  const perguntasOrdenadas = [...perguntas].sort((a, b) => a.ordem - b.ordem);
  for (const perguntaDef of perguntasOrdenadas) {
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
      data: {
        questionarioVersaoId: versao.id,
        texto: perguntaDef.texto,
        ordem: perguntaDef.ordem,
        dependeDeOpcaoId,
      },
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

async function seedRotinas(tiposPeleIds: Map<TipoNome, number>): Promise<void> {
  for (const rotinaDef of rotinas) {
    const tipoPeleId = tiposPeleIds.get(rotinaDef.tipo);
    if (tipoPeleId === undefined) {
      throw new Error(`Tipo de pele "${rotinaDef.tipo}" não existe (rotina).`);
    }
    const rotina = await prisma.rotina.upsert({
      where: { tipoPeleId },
      update: { descricao: rotinaDef.descricao },
      create: { tipoPeleId, descricao: rotinaDef.descricao },
    });
    // Itens: apaga e recria (aceitável em seed).
    await prisma.itemRotina.deleteMany({ where: { rotinaId: rotina.id } });
    for (const item of rotinaDef.itens) {
      await prisma.itemRotina.create({
        data: {
          rotinaId: rotina.id,
          etapa: item.etapa,
          descricao: item.descricao,
          ordem: item.ordem,
        },
      });
    }
  }
}

// Catálogo de produtos de exemplo (C4). Conteúdo ilustrativo, não é indicação real.
const produtos: { nome: string; marca: string; etapa: EtapaRotina; descricao: string }[] = [
  { nome: 'Gel de limpeza com ácido salicílico', marca: 'Linha Controle', etapa: 'LIMPEZA', descricao: 'Limpeza para pele oleosa e acneica.' },
  { nome: 'Loção de limpeza suave', marca: 'Linha Calm', etapa: 'LIMPEZA', descricao: 'Limpeza sem sabão para pele seca ou sensível.' },
  { nome: 'Tônico adstringente sem álcool', marca: 'Linha Controle', etapa: 'TONIFICACAO', descricao: 'Equilíbrio da zona T sem ressecar.' },
  { nome: 'Sérum de niacinamida', marca: 'Linha Ativa', etapa: 'TRATAMENTO', descricao: 'Controle de oleosidade e uniformização.' },
  { nome: 'Sérum de ácido hialurônico', marca: 'Linha Hidra', etapa: 'TRATAMENTO', descricao: 'Hidratação profunda antes do hidratante.' },
  { nome: 'Hidratante oil-free em gel', marca: 'Linha Controle', etapa: 'HIDRATACAO', descricao: 'Hidratação leve para pele oleosa.' },
  { nome: 'Hidratante com ceramidas', marca: 'Linha Hidra', etapa: 'HIDRATACAO', descricao: 'Reforço da barreira para pele seca.' },
  { nome: 'Protetor solar toque seco FPS 50', marca: 'Linha Sol', etapa: 'PROTECAO_SOLAR', descricao: 'Proteção sem oleosidade, para o dia a dia.' },
];

async function seedProdutos(): Promise<void> {
  // Idempotente: recria (aceitável em seed). Cascade remove as sugestões associadas.
  await prisma.produto.deleteMany();
  for (const p of produtos) {
    await prisma.produto.create({ data: p });
  }
}

// Uma biomédica única (ADR-0011): novas usuárias Premium são associadas a ela.
async function seedBiomedica(): Promise<void> {
  const senhaHash = await bcrypt.hash('biomedica123', 10);
  await prisma.biomedica.upsert({
    where: { email: 'biomedica@dermamatch.com' },
    update: {},
    create: {
      nome: 'Dra. Helena Costa',
      registro: 'CRBM-12345',
      email: 'biomedica@dermamatch.com',
      senhaHash,
      ativa: true,
    },
  });
}

// Um admin único (ADR-0016) — gerencia biomédicas, questionário, tipos de pele e produtos.
async function seedAdmin(): Promise<void> {
  const senhaHash = await bcrypt.hash('admin123', 10);
  await prisma.admin.upsert({
    where: { email: 'admin@dermamatch.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@dermamatch.com',
      senhaHash,
      ativa: true,
    },
  });
}

async function main(): Promise<void> {
  const tiposPeleIds = await seedTiposPele();
  await seedQuestionario(tiposPeleIds);
  await seedRotinas(tiposPeleIds);
  await seedProdutos();
  await seedBiomedica();
  await seedAdmin();
}

try {
  await main();
  console.log(
    `seed concluído: ${tiposPele.length} tipos de pele, ${perguntas.length} perguntas, ` +
      `${rotinas.length} rotinas, ${produtos.length} produtos, 1 biomédica, 1 admin.`,
  );
} catch (err) {
  console.error('falha no seed:', err);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
