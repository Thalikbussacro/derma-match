import { Router } from 'express';
import { adminAuthController } from '../controllers/admin-auth.controller.js';
import { loginLimiter } from '../middlewares/rate-limit.js';

export const adminRouter = Router();

// Auth (público). Guards por tipo entram nas rotas de gestão (C1.3+).
adminRouter.post('/login', loginLimiter, adminAuthController.login);
adminRouter.post('/refresh', adminAuthController.refresh);
adminRouter.post('/logout', adminAuthController.logout);
