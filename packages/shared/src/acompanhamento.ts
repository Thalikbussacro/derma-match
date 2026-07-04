import { z } from 'zod';

// --- Diário de pele ---

export const criarRegistroDiarioSchema = z
  .object({
    condicao: z.number().int().min(1).max(5),
    tags: z.array(z.string().min(1).max(40)).max(8),
    nota: z.string().max(500).nullable().optional(),
  })
  .strict();
export type CriarRegistroDiarioInput = z.infer<typeof criarRegistroDiarioSchema>;

export const registroDiarioResponseSchema = z.object({
  id: z.number(),
  condicao: z.number(),
  tags: z.array(z.string()),
  nota: z.string().nullable(),
  criadoEm: z.string(),
});
export type RegistroDiarioResponse = z.infer<typeof registroDiarioResponseSchema>;

// --- Adesão à rotina ---

export const adesaoResponseSchema = z.object({
  streak: z.number(),
  checkinHoje: z.boolean(),
  // Últimos 7 dias, do mais antigo ao mais recente (hoje por último).
  ultimos7: z.array(z.boolean()),
});
export type AdesaoResponse = z.infer<typeof adesaoResponseSchema>;

// --- Meta de pele ---

export const definirMetaSchema = z.object({ meta: z.string().max(200).nullable() }).strict();
export type DefinirMetaInput = z.infer<typeof definirMetaSchema>;

// --- Conteúdo educativo (dicas) ---

export const dicaResponseSchema = z.object({
  id: z.number(),
  titulo: z.string(),
  conteudo: z.string(),
});
export type DicaResponse = z.infer<typeof dicaResponseSchema>;

export const criarDicaSchema = z
  .object({ titulo: z.string().min(3).max(160), conteudo: z.string().min(3) })
  .strict();
export type CriarDicaInput = z.infer<typeof criarDicaSchema>;

export const atualizarDicaSchema = z
  .object({
    titulo: z.string().min(3).max(160).optional(),
    conteudo: z.string().min(3).optional(),
    ativa: z.boolean().optional(),
  })
  .strict();
export type AtualizarDicaInput = z.infer<typeof atualizarDicaSchema>;

export interface DicaAdmin {
  id: number;
  titulo: string;
  conteudo: string;
  ativa: boolean;
}
