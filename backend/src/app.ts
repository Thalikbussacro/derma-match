import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

// Confia em N proxies à frente (afeta req.ip, base do rate limit por IP). Ver env TRUST_PROXY.
app.set('trust proxy', env.TRUST_PROXY);

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

// Em produção o frontend é servido pela própria app (mesma origem), mas o Render expõe a
// URL externa em RENDER_EXTERNAL_URL; liberamos essa origem para o CORS não barrar os POSTs
// (que sempre mandam Origin) sem precisar configurar a URL na mão a cada deploy.
const origensPermitidas = [...env.CORS_ORIGIN];
if (process.env.RENDER_EXTERNAL_URL) {
  origensPermitidas.push(process.env.RENDER_EXTERNAL_URL);
}

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests sem Origin (curl, apps nativos, same-origin GET) passam.
      if (!origin || origensPermitidas.includes(origin)) {
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

// Em produção o próprio backend serve o build do frontend, na mesma origem — assim os cookies
// sameSite=strict e a sessão funcionam sem depender de CORS entre domínios. Precisa vir ANTES do
// portão de autenticação abaixo; caso contrário os assets e as rotas do SPA seriam barrados como
// se fossem rotas de API.
if (env.NODE_ENV === 'production') {
  const frontendDist = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '../../frontend/dist');
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    // Rotas de cliente (ex.: /admin, /biomedica, /conta) devolvem o index.html do SPA; qualquer
    // coisa em /api segue o fluxo normal de API.
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      res.sendFile('index.html', { root: frontendDist }, (err) => {
        if (err) next(err);
      });
    } else {
      next();
    }
  });
}

// Fail-safe: toda rota é protegida por padrão. Rota pública exige entrada explícita aqui.
const rotasPublicas = new Set([
  'POST /api/auth/cadastro',
  'POST /api/auth/login',
  'POST /api/auth/refresh',
  'POST /api/auth/logout',
  'POST /api/auth/recuperar-senha',
  'POST /api/auth/redefinir-senha',
  'POST /api/biomedica/login',
  'POST /api/biomedica/refresh',
  'POST /api/biomedica/logout',
  'POST /api/admin/login',
  'POST /api/admin/refresh',
  'POST /api/admin/logout',
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
