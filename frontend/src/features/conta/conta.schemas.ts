import { z } from 'zod';

export const editarNomeSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome.').max(120),
});
export type EditarNomeForm = z.infer<typeof editarNomeSchema>;

export const trocarSenhaSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Informe a senha atual.'),
    novaSenha: z.string().min(8, 'A nova senha precisa de ao menos 8 caracteres.').max(72),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });
export type TrocarSenhaForm = z.infer<typeof trocarSenhaSchema>;
