import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HttpError, ValidationError } from '../errors/http-error.js';
import { logger } from '../lib/logger.js';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
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

  // Erros do framework (ex.: body-parser em JSON malformado, payload grande) carregam status
  // HTTP próprio. Honrar erros de cliente (4xx) para não mascará-los como falha do servidor.
  const statusCliente = statusHttpDeCliente(err);
  if (statusCliente !== undefined) {
    res.status(statusCliente).json({
      codigo: 'REQUISICAO_INVALIDA',
      mensagem: 'Requisição inválida.',
    });
    return;
  }

  logger.error({ err }, 'erro não tratado');
  res.status(500).json({
    codigo: 'ERRO_INTERNO',
    mensagem: 'Erro interno.',
  });
}

function statusHttpDeCliente(err: unknown): number | undefined {
  if (typeof err !== 'object' || err === null) return undefined;
  const e = err as { status?: unknown; statusCode?: unknown };
  const candidato = typeof e.status === 'number' ? e.status : e.statusCode;
  if (typeof candidato === 'number' && candidato >= 400 && candidato < 500) {
    return candidato;
  }
  return undefined;
}
