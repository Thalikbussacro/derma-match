import { Router } from 'express';
import { exigirUsuaria } from '../middlewares/exigir-tipo.js';
import { assinaturaRouter } from './assinatura.routes.js';
import { authRouter } from './auth.routes.js';
import { biomedicaRouter } from './biomedica.routes.js';
import { contaRouter } from './conta.routes.js';
import { healthRouter } from './health.routes.js';
import { premiumRouter } from './premium.routes.js';
import { questionarioRouter } from './questionario.routes.js';
import { rotinaRouter } from './rotina.routes.js';

export const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/biomedica', biomedicaRouter);

// Rotas da usuária: exigem token do tipo USUARIA (biomédica não acessa).
router.use('/me', exigirUsuaria, contaRouter);
router.use('/questionario', exigirUsuaria, questionarioRouter);
router.use('/rotina', exigirUsuaria, rotinaRouter);
router.use('/premium', exigirUsuaria, premiumRouter);
router.use('/assinatura', exigirUsuaria, assinaturaRouter);
