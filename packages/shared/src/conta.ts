import { z } from 'zod';

export const atualizarContaSchema = z
  .object({
    nome: z.string().min(2).max(120).optional(),
    senhaAtual: z.string().min(1).max(72).optional(),
    novaSenha: z.string().min(8).max(72).optional(),
  })
  .strict()
  .refine((data) => (data.senhaAtual === undefined) === (data.novaSenha === undefined), {
    message: 'Para trocar a senha, informe senhaAtual e novaSenha juntas.',
    path: ['novaSenha'],
  });
export type AtualizarContaInput = z.infer<typeof atualizarContaSchema>;
