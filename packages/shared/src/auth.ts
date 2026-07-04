import { z } from 'zod';

export const PLANOS = ['FREE', 'PREMIUM'] as const;
export type Plano = (typeof PLANOS)[number];

// --- Requests (contrato de entrada; espelham a validação do backend) ---

export const cadastroSchema = z
  .object({
    nome: z.string().min(2).max(120),
    email: z.string().trim().toLowerCase().email().max(160),
    senha: z.string().min(8).max(72),
    aceiteLgpd: z.literal(true),
  })
  .strict();
export type CadastroInput = z.infer<typeof cadastroSchema>;

export const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(160),
    senha: z.string().min(1).max(72),
  })
  .strict();
export type LoginInput = z.infer<typeof loginSchema>;

export const recuperarSenhaSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(160),
  })
  .strict();
export type RecuperarSenhaInput = z.infer<typeof recuperarSenhaSchema>;

export const redefinirSenhaSchema = z
  .object({
    token: z.string().min(1),
    novaSenha: z.string().min(8).max(72),
  })
  .strict();
export type RedefinirSenhaInput = z.infer<typeof redefinirSenhaSchema>;

// --- Response ---

export const usuarioResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  email: z.string(),
  plano: z.enum(PLANOS),
  tipoPelePredominanteId: z.number().nullable(),
  metaPele: z.string().nullable(),
});
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;

export const biomedicaResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  registro: z.string(),
  email: z.string(),
});
export type BiomedicaResponse = z.infer<typeof biomedicaResponseSchema>;

export const adminResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  email: z.string(),
});
export type AdminResponse = z.infer<typeof adminResponseSchema>;
