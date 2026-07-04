import { z } from 'zod';

export const criarBiomedicaSchema = z
  .object({
    nome: z.string().min(2).max(120),
    registro: z.string().min(2).max(40),
    email: z.string().trim().toLowerCase().email().max(160),
    senha: z.string().min(8).max(72),
  })
  .strict();
export type CriarBiomedicaInput = z.infer<typeof criarBiomedicaSchema>;

// Visão de biomédica para o admin (inclui `ativa`, diferente do BiomedicaResponse de login).
export const biomedicaAdminSchema = z.object({
  id: z.number(),
  nome: z.string(),
  registro: z.string(),
  email: z.string(),
  ativa: z.boolean(),
});
export type BiomedicaAdmin = z.infer<typeof biomedicaAdminSchema>;

// --- Questionário configurável (admin, sobre o rascunho) ---

export const criarPerguntaSchema = z
  .object({
    texto: z.string().min(3).max(500),
    ordem: z.number().int().min(1),
    dependeDeOpcaoId: z.number().int().nullable().optional(),
  })
  .strict();
export type CriarPerguntaInput = z.infer<typeof criarPerguntaSchema>;

export const atualizarPerguntaSchema = z
  .object({
    texto: z.string().min(3).max(500).optional(),
    ordem: z.number().int().min(1).optional(),
    dependeDeOpcaoId: z.number().int().nullable().optional(),
  })
  .strict();
export type AtualizarPerguntaInput = z.infer<typeof atualizarPerguntaSchema>;

export const criarOpcaoSchema = z
  .object({ perguntaId: z.number().int(), texto: z.string().min(1).max(200) })
  .strict();
export type CriarOpcaoInput = z.infer<typeof criarOpcaoSchema>;

export const atualizarOpcaoSchema = z.object({ texto: z.string().min(1).max(200) }).strict();
export type AtualizarOpcaoInput = z.infer<typeof atualizarOpcaoSchema>;

export const definirPesoSchema = z
  .object({
    opcaoId: z.number().int(),
    tipoPeleId: z.number().int(),
    peso: z.number().int().min(0).max(20),
  })
  .strict();
export type DefinirPesoInput = z.infer<typeof definirPesoSchema>;

// Conteúdo do rascunho para edição no admin.
export interface RascunhoTipoPele {
  id: number;
  nome: string;
}
export interface RascunhoPeso {
  tipoPeleId: number;
  peso: number;
}
export interface RascunhoOpcao {
  id: number;
  texto: string;
  pesos: RascunhoPeso[];
}
export interface RascunhoPergunta {
  id: number;
  texto: string;
  ordem: number;
  dependeDeOpcaoId: number | null;
  opcoes: RascunhoOpcao[];
}
export interface QuestionarioRascunho {
  versaoId: number;
  numero: number;
  tipos: RascunhoTipoPele[];
  perguntas: RascunhoPergunta[];
}
