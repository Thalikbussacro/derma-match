import type { Request } from 'express';
import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    codigo: 'MUITAS_TENTATIVAS',
    mensagem: 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.',
  },
});

function chavePorEmail(req: Request): string {
  const body = req.body as { email?: unknown };
  return typeof body.email === 'string' ? body.email.trim().toLowerCase() : (req.ip ?? 'sem-ip');
}

export const recuperarSenhaLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 3,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: chavePorEmail,
  message: {
    codigo: 'MUITAS_TENTATIVAS',
    mensagem: 'Muitas solicitações de recuperação de senha. Tente novamente mais tarde.',
  },
});

// Chave por principal autenticado (usuária ou biomédica), sem colisão entre os tipos.
function chavePorPrincipal(req: Request): string {
  return req.usuario ? `${req.usuario.tipoUsuario}:${req.usuario.id}` : (req.ip ?? 'sem-ip');
}

// Freia envio de mensagens (inclui upload de foto) para evitar spam e abuso de disco.
export const mensagemLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: chavePorPrincipal,
  message: {
    codigo: 'MUITAS_MENSAGENS',
    mensagem: 'Você está enviando mensagens rápido demais. Aguarde um momento.',
  },
});
