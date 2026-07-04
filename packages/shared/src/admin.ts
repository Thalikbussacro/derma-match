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
