import 'dotenv/config';
import { app } from './app.js';
import { env } from './config/env.js';
import { iniciarAgendador } from './lib/agendador.js';
import { logger } from './lib/logger.js';

iniciarAgendador();

app.listen(env.PORT, () => {
  logger.info({ ambiente: env.NODE_ENV, porta: env.PORT }, 'servidor no ar');
});
