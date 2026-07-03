import type { Request } from 'express';
import { UnauthorizedError } from '../errors/http-error.js';

// Extrai o id do usuário autenticado (populado por `authenticate`). Guarda defensiva:
// as rotas de domínio são protegidas, mas nunca confiamos que `req.usuario` está presente.
export function usuarioIdAutenticado(req: Request): number {
  if (!req.usuario) {
    throw new UnauthorizedError();
  }
  return req.usuario.id;
}

// Mesmo id do principal autenticado, com nome explícito para as rotas da biomédica.
export const biomedicaIdAutenticado = usuarioIdAutenticado;
