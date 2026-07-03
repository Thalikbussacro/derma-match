import { Router } from 'express';
import { contaController } from '../controllers/conta.controller.js';

export const contaRouter = Router();

contaRouter.get('/', contaController.buscarPerfil);
contaRouter.patch('/', contaController.atualizar);
contaRouter.delete('/', contaController.excluir);
