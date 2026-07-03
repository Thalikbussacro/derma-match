import 'dotenv/config';
import { env } from './config/env.js';

console.log(`config carregada: NODE_ENV=${env.NODE_ENV}, PORT=${env.PORT} (${typeof env.PORT})`);
