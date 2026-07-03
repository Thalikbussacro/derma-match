import { z } from 'zod';

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

export const usuarioResponseSchema = z.object({
  id: z.number(),
  nome: z.string(),
  email: z.string(),
  plano: z.enum(['FREE', 'PREMIUM']),
  tipoPelePredominanteId: z.number().nullable(),
});

export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;
