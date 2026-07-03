import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { contaRouter } from './conta.routes.js';
import { questionarioRouter } from './questionario.routes.js';
import { rotinaRouter } from './rotina.routes.js';
import { premiumRouter } from './premium.routes.js';

export const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/me', contaRouter);
router.use('/questionario', questionarioRouter);
router.use('/rotina', rotinaRouter);
router.use('/premium', premiumRouter);
