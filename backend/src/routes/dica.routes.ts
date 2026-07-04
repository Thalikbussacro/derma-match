import { Router } from 'express';
import { dicaController } from '../controllers/dica.controller.js';

export const dicaRouter = Router();

dicaRouter.get('/', dicaController.listar);
