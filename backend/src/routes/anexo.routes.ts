import { Router } from 'express';
import { anexoController } from '../controllers/anexo.controller.js';

export const anexoRouter = Router();

// Acessível por usuária (dona) e biomédica (da conversa); a autorização é no service.
anexoRouter.get('/:id', anexoController.baixar);
