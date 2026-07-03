import type { NextFunction, Request, Response } from 'express';
import { usuarioIdAutenticado } from '../lib/usuario-autenticado.js';
import { responderPerguntaSchema } from '../schemas/questionario.schema.js';
import { questionarioService } from '../services/questionario.service.js';

export const questionarioController = {
  obterEstado: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const estado = await questionarioService.obterEstado(usuarioIdAutenticado(req));
      res.status(200).json(estado);
    } catch (err) {
      next(err);
    }
  },

  obterProximaPergunta: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const pergunta = await questionarioService.obterProximaPergunta(usuarioIdAutenticado(req));
      res.status(200).json({ pergunta });
    } catch (err) {
      next(err);
    }
  },

  responder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = responderPerguntaSchema.parse(req.body);
      await questionarioService.responder(usuarioIdAutenticado(req), input);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  refazer: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await questionarioService.refazer(usuarioIdAutenticado(req));
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  finalizar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const resultado = await questionarioService.finalizar(usuarioIdAutenticado(req));
      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  },
};
