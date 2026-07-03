import { Router } from 'express';
import { conversaController } from '../controllers/conversa.controller.js';
import { uploadFotoOpcional } from '../lib/uploads.js';
import { mensagemLimiter } from '../middlewares/rate-limit.js';

export const conversaRouter = Router();

conversaRouter.get('/', conversaController.obter);
conversaRouter.post('/', conversaController.iniciar);
conversaRouter.get('/mensagens', conversaController.listarMensagens);
// Rate limit antes do upload: freia spam e evita gravar arquivos que seriam rejeitados.
conversaRouter.post(
  '/mensagens',
  mensagemLimiter,
  uploadFotoOpcional,
  conversaController.enviarMensagem,
);
