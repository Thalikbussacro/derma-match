import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError, ValidationError } from '../errors/http-error.js';
import { logger } from '../lib/logger.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    const corpo: { codigo: string; mensagem: string; detalhes?: unknown } = {
      codigo: err.codigo,
      mensagem: err.message,
    };
    if (err instanceof ValidationError && err.detalhes !== undefined) {
      corpo.detalhes = err.detalhes;
    }
    res.status(err.status).json(corpo);
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      codigo: 'VALIDACAO',
      mensagem: 'Campos inválidos.',
      detalhes: err.issues.map((issue) => ({
        campo: issue.path.join('.'),
        erro: issue.message,
      })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({
      codigo: 'CONFLITO',
      mensagem: 'Registro já existe.',
    });
    return;
  }

  logger.error({ err }, 'erro não tratado');
  res.status(500).json({
    codigo: 'ERRO_INTERNO',
    mensagem: 'Erro interno.',
  });
}
