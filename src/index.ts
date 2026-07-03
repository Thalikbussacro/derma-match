import 'dotenv/config';
import { env } from './config/env.js';
import { app } from './app.js';
import { logger } from './lib/logger.js';

app.listen(env.PORT, () => {
  logger.info({ ambiente: env.NODE_ENV, porta: env.PORT }, 'servidor no ar');
});
