import 'dotenv/config';
import { env } from './config/env.js';
import { logger } from './lib/logger.js';

logger.info({ ambiente: env.NODE_ENV, porta: env.PORT }, 'configuração carregada');
