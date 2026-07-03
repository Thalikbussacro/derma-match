import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';
import { notFound } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';
import { router } from './routes/index.js';
import { ForbiddenError } from './errors/http-error.js';
import { authenticate } from './middlewares/authenticate.js';

export const app = express();

app.use(
  pinoHttp({
    logger,
    customLogLevel: (_req, res, err) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  }),
);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Requests sem Origin (curl, apps nativos, same-origin) passam.
      if (!origin || env.CORS_ORIGIN.includes(origin)) {
        callback(null, true);
      } else {
        callback(new ForbiddenError('Origem não permitida pelo CORS.'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Fail-safe: toda rota é protegida por padrão. Rota pública exige entrada explícita aqui.
const rotasPublicas = new Set([
  'POST /api/auth/cadastro',
  'POST /api/auth/login',
  'POST /api/auth/refresh',
  'POST /api/auth/logout',
  'POST /api/auth/recuperar-senha',
  'POST /api/auth/redefinir-senha',
  'GET /api/health',
]);

app.use((req, res, next) => {
  if (rotasPublicas.has(`${req.method} ${req.path}`)) {
    next();
    return;
  }
  authenticate(req, res, next);
});

app.use('/api', router);

app.use(notFound);
app.use(errorHandler);
