import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';

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
