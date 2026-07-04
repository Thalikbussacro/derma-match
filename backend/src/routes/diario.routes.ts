import { Router } from 'express';
import { diarioController } from '../controllers/diario.controller.js';

export const diarioRouter = Router();

diarioRouter.get('/', diarioController.listar);
diarioRouter.post('/', diarioController.criar);
diarioRouter.delete('/:id', diarioController.remover);
