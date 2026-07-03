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
});
export type RotinaResponse = z.infer<typeof rotinaResponseSchema>;
