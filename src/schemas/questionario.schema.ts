import { z } from 'zod';

export const responderPerguntaSchema = z
  .object({
    perguntaId: z.number().int().positive(),
    opcaoId: z.number().int().positive(),
  })
  .strict();

export type ResponderPerguntaInput = z.infer<typeof responderPerguntaSchema>;

export const perguntaResponseSchema = z.object({
  id: z.number(),
  texto: z.string(),
  ordem: z.number(),
  opcoes: z.array(z.object({ id: z.number(), texto: z.string() })),
});

export type PerguntaResponse = z.infer<typeof perguntaResponseSchema>;

export const estadoQuestionarioResponseSchema = z.object({
  estado: z.enum(['NAO_INICIADO', 'EM_ANDAMENTO', 'CONCLUIDO']),
  perguntasRespondidas: z.number(),
  totalPerguntas: z.number(),
  tipoPeleId: z.number().nullable(),
});

export type EstadoQuestionarioResponse = z.infer<typeof estadoQuestionarioResponseSchema>;
