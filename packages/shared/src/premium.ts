import { z } from 'zod';

export const painelUpgradeResponseSchema = z.object({
  titulo: z.string(),
  descricao: z.string(),
  beneficios: z.array(z.string()),
  aviso: z.string(),
});
export type PainelUpgradeResponse = z.infer<typeof painelUpgradeResponseSchema>;
