import { z } from 'zod';

export const ESTADOS_QUESTIONARIO = ['NAO_INICIADO', 'EM_ANDAMENTO', 'CONCLUIDO'] as const;
export type EstadoQuestionarioNome = (typeof ESTADOS_QUESTIONARIO)[number];

// --- Request ---

export const responderPerguntaSchema = z
  .object({
    perguntaId: z.number().int().positive(),
    opcaoId: z.number().int().positive(),
  })
  .strict();
export type ResponderPerguntaInput = z.infer<typeof responderPerguntaSchema>;

// --- Response ---

export const opcaoResponseSchema = z.object({ id: z.number(), texto: z.string() });
export type OpcaoResponse = z.infer<typeof opcaoResponseSchema>;

export const perguntaResponseSchema = z.object({
  id: z.number(),
  texto: z.string(),
  ordem: z.number(),
  opcoes: z.array(opcaoResponseSchema),
});
export type PerguntaResponse = z.infer<typeof perguntaResponseSchema>;

export const estadoQuestionarioResponseSchema = z.object({
  estado: z.enum(ESTADOS_QUESTIONARIO),
  perguntasRespondidas: z.number(),
  totalPerguntas: z.number(),
  tipoPeleId: z.number().nullable(),
});
export type EstadoQuestionarioResponse = z.infer<typeof estadoQuestionarioResponseSchema>;

export const resultadoTipoPeleSchema = z.object({
  tipoPeleId: z.number(),
  tipoPeleNome: z.string(),
});
export type ResultadoTipoPele = z.infer<typeof resultadoTipoPeleSchema>;
