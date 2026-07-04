import { z } from 'zod';
import { adesaoResponseSchema } from './acompanhamento.js';

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

// --- Área da biomédica ---

export const conversaBiomedicaResponseSchema = z.object({
  id: z.number(),
  usuarioNome: z.string(),
  ultimaMensagem: z.string(),
  ultimaAtividade: z.string(),
  naoRespondida: z.boolean(),
});
export type ConversaBiomedicaResponse = z.infer<typeof conversaBiomedicaResponseSchema>;

export const contextoClinicoResponseSchema = z.object({
  usuarioNome: z.string(),
  tipoPeleNome: z.string().nullable(),
  tipoPeleNivel: z.number().nullable(),
  meta: z.string().nullable(),
  adesao: adesaoResponseSchema,
  respostas: z.array(z.object({ pergunta: z.string(), resposta: z.string() })),
});
export type ContextoClinicoResponse = z.infer<typeof contextoClinicoResponseSchema>;

// --- Request ---

export const enviarMensagemSchema = z
  .object({
    conteudo: z.string().min(1, 'Escreva uma mensagem.').max(2000),
  })
  .strict();
export type EnviarMensagemInput = z.infer<typeof enviarMensagemSchema>;
