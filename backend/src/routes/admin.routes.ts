import { Router } from 'express';
import { adminAuthController } from '../controllers/admin-auth.controller.js';
import { adminBiomedicaController } from '../controllers/admin-biomedica.controller.js';
import { exigirAdmin } from '../middlewares/exigir-tipo.js';
import { loginLimiter } from '../middlewares/rate-limit.js';

export const adminRouter = Router();

// Auth (público).
adminRouter.post('/login', loginLimiter, adminAuthController.login);
adminRouter.post('/refresh', adminAuthController.refresh);
adminRouter.post('/logout', adminAuthController.logout);

// Gestão (exige token de admin).
adminRouter.get('/biomedicas', exigirAdmin, adminBiomedicaController.listar);
adminRouter.post('/biomedicas', exigirAdmin, adminBiomedicaController.criar);
adminRouter.patch('/biomedicas/:id/ativa', exigirAdmin, adminBiomedicaController.definirAtiva);
