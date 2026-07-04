import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/http-error.js';
import {
  atualizarOpcaoSchema,
  atualizarPerguntaSchema,
  criarOpcaoSchema,
  criarPerguntaSchema,
  definirPesoSchema,
} from '../schemas/admin.schema.js';
import { questionarioAdminService } from '../services/questionario-admin.service.js';

function idParam(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new NotFoundError('Registro');
  }
  return id;
}

export const questionarioAdminController = {
  obterRascunho: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await questionarioAdminService.obterRascunho());
    } catch (err) {
      next(err);
    }
  },

  publicar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.publicar();
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  criarPergunta: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.criarPergunta(criarPerguntaSchema.parse(req.body));
      res.status(201).end();
    } catch (err) {
      next(err);
    }
  },

  atualizarPergunta: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.atualizarPergunta(idParam(req), atualizarPerguntaSchema.parse(req.body));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  removerPergunta: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.removerPergunta(idParam(req));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  criarOpcao: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.criarOpcao(criarOpcaoSchema.parse(req.body));
      res.status(201).end();
    } catch (err) {
      next(err);
    }
  },

  atualizarOpcao: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.atualizarOpcao(idParam(req), atualizarOpcaoSchema.parse(req.body));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  removerOpcao: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.removerOpcao(idParam(req));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  definirPeso: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioAdminService.definirPeso(definirPesoSchema.parse(req.body));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
