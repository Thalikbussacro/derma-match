import { Router } from 'express';
import { rotinaController } from '../controllers/rotina.controller.js';

export const rotinaRouter = Router();

rotinaRouter.get('/', rotinaController.buscarDoUsuario);
rotinaRouter.post('/checkin', rotinaController.checkin);
rotinaRouter.get('/adesao', rotinaController.adesao);
