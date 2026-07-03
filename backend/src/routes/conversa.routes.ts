import { Router } from 'express';
import { conversaController } from '../controllers/conversa.controller.js';

export const conversaRouter = Router();

conversaRouter.get('/', conversaController.obter);
conversaRouter.post('/', conversaController.iniciar);
conversaRouter.get('/mensagens', conversaController.listarMensagens);
conversaRouter.post('/mensagens', conversaController.enviarMensagem);
