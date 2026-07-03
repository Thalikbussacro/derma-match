import { Router } from 'express';
import { biomedicaAuthController } from '../controllers/biomedica-auth.controller.js';
import { loginLimiter } from '../middlewares/rate-limit.js';

export const biomedicaRouter = Router();

// Autenticação da biomédica (público). As rotas de atendimento (área autenticada) são
// registradas separadamente com o guard exigirBiomedica.
biomedicaRouter.post('/login', loginLimiter, biomedicaAuthController.login);
biomedicaRouter.post('/refresh', biomedicaAuthController.refresh);
biomedicaRouter.post('/logout', biomedicaAuthController.logout);
