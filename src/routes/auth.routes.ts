import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/cadastro', authController.cadastrar);
authRouter.post('/login', authController.login);
authRouter.post('/refresh', authController.refresh);
authRouter.post('/logout', authController.logout);
