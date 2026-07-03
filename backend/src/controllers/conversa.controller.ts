import type { NextFunction, Request, Response } from 'express';
import { enviarMensagemSchema } from '@derma-match/shared';
import { usuarioIdAutenticado } from '../lib/usuario-autenticado.js';
import { conversaService } from '../services/conversa.service.js';

export const conversaController = {
  obter: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversa = await conversaService.obter(usuarioIdAutenticado(req));
      res.status(200).json({ conversa });
    } catch (err) {
      next(err);
    }
  },

  iniciar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversa = await conversaService.iniciar(usuarioIdAutenticado(req));
      res.status(201).json(conversa);
    } catch (err) {
      next(err);
    }
  },

  listarMensagens: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mensagens = await conversaService.listarMensagens(usuarioIdAutenticado(req));
      res.status(200).json({ mensagens });
    } catch (err) {
      next(err);
    }
  },

  enviarMensagem: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = enviarMensagemSchema.parse(req.body);
      const mensagem = await conversaService.enviarMensagem(
        usuarioIdAutenticado(req),
        input.conteudo,
      );
      res.status(201).json(mensagem);
    } catch (err) {
      next(err);
    }
  },
};
