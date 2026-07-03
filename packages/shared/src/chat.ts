import { z } from 'zod';

export const AUTORES_MENSAGEM = ['USUARIA', 'BIOMEDICA'] as const;
export type AutorMensagem = (typeof AUTORES_MENSAGEM)[number];

export const anexoResponseSchema = z.object({
  id: z.number(),
  tipo: z.string(),
});
export type AnexoResponse = z.infer<typeof anexoResponseSchema>;

export const mensagemResponseSchema = z.object({
  id: z.number(),
  autorTipo: z.enum(AUTORES_MENSAGEM),
  conteudo: z.string(),
  criadoEm: z.string(),
  anexos: z.array(anexoResponseSchema),
});
export type MensagemResponse = z.infer<typeof mensagemResponseSchema>;

export const conversaResponseSchema = z.object({
  id: z.number(),
  biomedicaNome: z.string(),
  ultimaAtividade: z.string(),
});
export type ConversaResponse = z.infer<typeof conversaResponseSchema>;

// --- Request ---

export const enviarMensagemSchema = z
  .object({
    conteudo: z.string().min(1, 'Escreva uma mensagem.').max(2000),
  })
  .strict();
export type EnviarMensagemInput = z.infer<typeof enviarMensagemSchema>;
