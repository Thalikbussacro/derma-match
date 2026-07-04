import { z } from 'zod';

export const ETAPAS = [
  'LIMPEZA',
  'TONIFICACAO',
  'HIDRATACAO',
  'PROTECAO_SOLAR',
  'TRATAMENTO',
] as const;
export type Etapa = (typeof ETAPAS)[number];

export const itemRotinaResponseSchema = z.object({
  id: z.number(),
  etapa: z.enum(ETAPAS),
  descricao: z.string(),
  ordem: z.number(),
});
export type ItemRotinaResponse = z.infer<typeof itemRotinaResponseSchema>;

export const rotinaResponseSchema = z.object({
  id: z.number(),
  tipoPele: z.object({ id: z.number(), nome: z.string() }),
  descricao: z.string(),
  itens: z.array(itemRotinaResponseSchema),
  // Quando a rotina foi personalizada pela biomédica (senão, é a base do tipo).
  personalizadaEm: z.string().nullable(),
});
export type RotinaResponse = z.infer<typeof rotinaResponseSchema>;

// --- Rotina personalizada (edição pela biomédica) ---

export const salvarRotinaSchema = z
  .object({
    itens: z
      .array(
        z.object({
          etapa: z.enum(ETAPAS),
          descricao: z.string().min(1).max(500),
          ordem: z.number().int().min(1),
          produtoId: z.number().int().nullable(),
        }),
      )
      .max(30),
  })
  .strict();
export type SalvarRotinaInput = z.infer<typeof salvarRotinaSchema>;

export interface ProdutoResumo {
  id: number;
  nome: string;
  marca: string | null;
  etapa: Etapa;
}

export interface ItemRotinaEdicao {
  etapa: Etapa;
  descricao: string;
  ordem: number;
  produtoId: number | null;
}

export interface RotinaEdicaoResponse {
  existe: boolean;
  atualizadoEm: string | null;
  usuarioNome: string;
  itens: ItemRotinaEdicao[];
  produtosSugeridos: ProdutoResumo[];
  catalogo: ProdutoResumo[];
}
