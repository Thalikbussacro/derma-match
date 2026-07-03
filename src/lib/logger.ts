import pino from 'pino';
import { env } from '../config/env.js';

const isDev = env.NODE_ENV === 'development';

// Nunca deixar credenciais entrarem no log (regra de segurança inviolável, RNF-SEC-014).
// Quando a autenticação entrar, esses headers carregam tokens.
const redact = {
  paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
  remove: true,
};

export const logger = pino(
  isDev
    ? {
        level: 'debug',
        redact,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss',
            ignore: 'pid,hostname',
          },
        },
      }
    : { level: 'info', redact },
);
