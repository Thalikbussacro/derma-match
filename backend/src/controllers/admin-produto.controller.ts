import type { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../errors/http-error.js';
import {
  associarProdutoSchema,
  atualizarProdutoSchema,
  criarProdutoSchema,
} from '../schemas/admin.schema.js';
import { adminProdutoService } from '../services/admin-produto.service.js';

export const adminProdutoController = {
  listar: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await adminProdutoService.listar());
    } catch (err) {
      next(err);
    }
  },

  criar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(201).json(await adminProdutoService.criar(criarProdutoSchema.parse(req.body)));
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      if (!Number.isInteger(id)) {
        throw new NotFoundError('Produto');
      }
      res
        .status(200)
        .json(await adminProdutoService.atualizar(id, atualizarProdutoSchema.parse(req.body)));
    } catch (err) {
      next(err);
    }
  },

  associar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminProdutoService.associar(associarProdutoSchema.parse(req.body));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  desassociar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await adminProdutoService.desassociar(associarProdutoSchema.parse(req.body));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
