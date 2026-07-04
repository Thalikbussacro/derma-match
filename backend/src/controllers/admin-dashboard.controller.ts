import type { NextFunction, Request, Response } from 'express';
import { adminDashboardService } from '../services/admin-dashboard.service.js';

export const adminDashboardController = {
  obter: async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.status(200).json(await adminDashboardService.obter());
    } catch (err) {
      next(err);
    }
  },
};
