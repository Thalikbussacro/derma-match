import { Router } from 'express';
import { questionarioController } from '../controllers/questionario.controller.js';

export const questionarioRouter = Router();

questionarioRouter.get('/estado', questionarioController.obterEstado);
questionarioRouter.get('/proxima', questionarioController.obterProximaPergunta);
questionarioRouter.post('/responder', questionarioController.responder);
questionarioRouter.post('/refazer', questionarioController.refazer);
questionarioRouter.post('/finalizar', questionarioController.finalizar);
