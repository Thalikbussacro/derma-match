import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { loginLimiter } from '../middlewares/rate-limit.js';

export const authRouter = Router();

authRouter.post('/cadastro', authController.cadastrar);
authRouter.post('/login', loginLimiter, authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
