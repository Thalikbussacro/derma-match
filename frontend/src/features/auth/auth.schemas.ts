import { z } from 'zod';
import type { UsuarioResponse } from '@derma-match/shared';

// O tipo do usuário vem do contrato compartilhado. Os schemas abaixo são de formulário
// (validação de UI, com confirmação de senha e mensagens em pt) — específicos do frontend.
export type Usuario = UsuarioResponse;

export const cadastroSchema = z
  .object({
    nome: z.string().min(2, 'Informe seu nome.').max(120),
    email: z.string().email('Email inválido.').max(160),
    senha: z.string().min(8, 'A senha precisa de ao menos 8 caracteres.').max(72),
    confirmarSenha: z.string(),
    aceiteLgpd: z
      .boolean()
      .refine((v) => v, { message: 'Você precisa aceitar os termos de uso e privacidade.' }),
  })
  .refine((d) => d.senha === d.confirmarSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });
export type CadastroForm = z.infer<typeof cadastroSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  senha: z.string().min(1, 'Informe a senha.'),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const recuperarSenhaSchema = z.object({
  email: z.string().email('Email inválido.'),
});
export type RecuperarSenhaForm = z.infer<typeof recuperarSenhaSchema>;

export const redefinirSenhaSchema = z
  .object({
    novaSenha: z.string().min(8, 'A senha precisa de ao menos 8 caracteres.').max(72),
    confirmarSenha: z.string(),
  })
  .refine((d) => d.novaSenha === d.confirmarSenha, {
    message: 'As senhas não conferem.',
    path: ['confirmarSenha'],
  });
export type RedefinirSenhaForm = z.infer<typeof redefinirSenhaSchema>;
