import type { NextFunction, Request, Response } from 'express';
import { usuarioIdAutenticado } from '../lib/usuario-autenticado.js';
import { atualizarContaSchema } from '../schemas/conta.schema.js';
import { contaService } from '../services/conta.service.js';

export const contaController = {
  buscarPerfil: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const perfil = await contaService.buscarPerfil(usuarioIdAutenticado(req));
      res.status(200).json(perfil);
    } catch (err) {
      next(err);
    }
  },

  exportarDados: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const dados = await contaService.exportarDados(usuarioIdAutenticado(req));
      res.setHeader('Content-Disposition', 'attachment; filename="meus-dados-derma-match.json"');
      res.status(200).json(dados);
    } catch (err) {
      next(err);
    }
  },

  atualizar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = atualizarContaSchema.parse(req.body);
      const perfil = await contaService.atualizar(usuarioIdAutenticado(req), input);
      res.status(200).json(perfil);
    } catch (err) {
      next(err);
    }
  },

  excluir: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await contaService.excluir(usuarioIdAutenticado(req));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },
};
