import { Router } from 'express';
import { premiumController } from '../controllers/premium.controller.js';

export const premiumRouter = Router();

premiumRouter.get('/painel-upgrade', premiumController.obterPainelUpgrade);
