import { Router } from 'express';
import { exigirUsuaria } from '../middlewares/exigir-tipo.js';
import { adminRouter } from './admin.routes.js';
import { anexoRouter } from './anexo.routes.js';
import { assinaturaRouter } from './assinatura.routes.js';
import { authRouter } from './auth.routes.js';
import { biomedicaRouter } from './biomedica.routes.js';
import { contaRouter } from './conta.routes.js';
import { conversaRouter } from './conversa.routes.js';
import { diarioRouter } from './diario.routes.js';
import { dicaRouter } from './dica.routes.js';
import { healthRouter } from './health.routes.js';
import { premiumRouter } from './premium.routes.js';
import { questionarioRouter } from './questionario.routes.js';
import { rotinaRouter } from './rotina.routes.js';

export const router = Router();

router.use(healthRouter);
router.use('/auth', authRouter);
router.use('/biomedica', biomedicaRouter);
router.use('/admin', adminRouter);

// Rotas da usuária: exigem token do tipo USUARIA (biomédica não acessa).
router.use('/me', exigirUsuaria, contaRouter);
router.use('/questionario', exigirUsuaria, questionarioRouter);
router.use('/rotina', exigirUsuaria, rotinaRouter);
router.use('/diario', exigirUsuaria, diarioRouter);
router.use('/dicas', exigirUsuaria, dicaRouter);
router.use('/premium', exigirUsuaria, premiumRouter);
router.use('/assinatura', exigirUsuaria, assinaturaRouter);
router.use('/conversa', exigirUsuaria, conversaRouter);
// Anexos: acessíveis por usuária (dona) e biomédica (da conversa); autorização no service.
router.use('/anexos', anexoRouter);
