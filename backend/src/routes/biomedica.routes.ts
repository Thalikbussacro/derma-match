import { Router } from 'express';
import { biomedicaAuthController } from '../controllers/biomedica-auth.controller.js';
import { biomedicaConversaController } from '../controllers/biomedica-conversa.controller.js';
import { exigirBiomedica } from '../middlewares/exigir-tipo.js';
import { loginLimiter, mensagemLimiter } from '../middlewares/rate-limit.js';

export const biomedicaRouter = Router();

// Autenticação (público).
biomedicaRouter.post('/login', loginLimiter, biomedicaAuthController.login);
biomedicaRouter.post('/refresh', biomedicaAuthController.refresh);
biomedicaRouter.post('/logout', biomedicaAuthController.logout);

// Área de atendimento (exige token de biomédica).
biomedicaRouter.get('/conversas', exigirBiomedica, biomedicaConversaController.listar);
biomedicaRouter.get(
  '/conversas/:id/mensagens',
  exigirBiomedica,
  biomedicaConversaController.listarMensagens,
);
biomedicaRouter.post(
  '/conversas/:id/mensagens',
  exigirBiomedica,
  mensagemLimiter,
  biomedicaConversaController.responder,
);
biomedicaRouter.get(
  '/conversas/:id/contexto',
  exigirBiomedica,
  biomedicaConversaController.contexto,
);
