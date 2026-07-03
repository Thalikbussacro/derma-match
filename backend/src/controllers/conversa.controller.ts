import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../errors/http-error.js';
import { caminhoRelativo, removerArquivo } from '../lib/uploads.js';
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

  // Recebe multipart: campo "conteudo" (texto) e/ou campo "foto" (imagem, opcional).
  enviarMensagem: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = req.body as { conteudo?: unknown };
      const conteudo = typeof body.conteudo === 'string' ? body.conteudo.trim() : '';
      const foto = req.file
        ? { caminhoRel: caminhoRelativo(req.file.path), tipo: req.file.mimetype }
        : undefined;

      if (!conteudo && !foto) {
        throw new ValidationError('Escreva uma mensagem ou envie uma foto.', 'MENSAGEM_VAZIA');
      }
      if (conteudo.length > 2000) {
        throw new ValidationError('Mensagem muito longa (máximo 2000 caracteres).');
      }

      const mensagem = await conversaService.enviarMensagem(
        usuarioIdAutenticado(req),
        conteudo,
        foto,
      );
      res.status(201).json(mensagem);
    } catch (err) {
      // Erro após o upload: remove o arquivo órfão (a transação garante que nada foi persistido).
      if (req.file) {
        void removerArquivo(caminhoRelativo(req.file.path));
      }
      next(err);
    }
  },
};
