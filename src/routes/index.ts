import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { authRouter } from './auth.routes.js';
import { contaRouter } from './conta.routes.js';

export const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/me', contaRouter);
