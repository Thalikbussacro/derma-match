import type { NextFunction, Request, Response } from 'express';
import { enviarMensagemSchema } from '@derma-match/shared';
import { ValidationError } from '../errors/http-error.js';
import { biomedicaIdAutenticado } from '../lib/usuario-autenticado.js';
import { biomedicaConversaService } from '../services/biomedica-conversa.service.js';

function conversaIdParam(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    throw new ValidationError('Conversa inválida.');
  }
  return id;
}

export const biomedicaConversaController = {
  listar: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const conversas = await biomedicaConversaService.listar(biomedicaIdAutenticado(req));
      res.status(200).json({ conversas });
    } catch (err) {
      next(err);
    }
  },

  listarMensagens: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const mensagens = await biomedicaConversaService.listarMensagens(
        biomedicaIdAutenticado(req),
        conversaIdParam(req),
      );
      res.status(200).json({ mensagens });
    } catch (err) {
      next(err);
    }
  },

  responder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const input = enviarMensagemSchema.parse(req.body);
      const mensagem = await biomedicaConversaService.responder(
        biomedicaIdAutenticado(req),
        conversaIdParam(req),
        input.conteudo,
      );
      res.status(201).json(mensagem);
    } catch (err) {
      next(err);
    }
  },

  contexto: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contexto = await biomedicaConversaService.contexto(
        biomedicaIdAutenticado(req),
        conversaIdParam(req),
      );
      res.status(200).json(contexto);
    } catch (err) {
      next(err);
    }
  },

  diario: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const registros = await biomedicaConversaService.diario(
        biomedicaIdAutenticado(req),
        conversaIdParam(req),
      );
      res.status(200).json({ registros });
    } catch (err) {
      next(err);
    }
  },
};
