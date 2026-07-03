import type { Request, Response } from 'express';
import { premiumService } from '../services/premium.service.js';

export const premiumController = {
  obterPainelUpgrade: (_req: Request, res: Response): void => {
    res.status(200).json(premiumService.obterPainelUpgrade());
  },
};
