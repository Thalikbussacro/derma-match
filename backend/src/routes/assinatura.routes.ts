import { Router } from 'express';
import { assinaturaController } from '../controllers/assinatura.controller.js';

export const assinaturaRouter = Router();

assinaturaRouter.post('/', assinaturaController.assinar);
assinaturaRouter.delete('/', assinaturaController.cancelar);
