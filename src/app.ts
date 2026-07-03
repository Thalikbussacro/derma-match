import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { notFound } from './middlewares/not-found.js';
import { errorHandler } from './middlewares/error-handler.js';

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Requests sem Origin (curl, apps nativos, same-origin) passam.
      if (!origin || env.CORS_ORIGIN.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Origem não permitida pelo CORS.'));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// As rotas de domínio são registradas aqui (ver src/routes) antes do notFound.

app.use(notFound);
app.use(errorHandler);
