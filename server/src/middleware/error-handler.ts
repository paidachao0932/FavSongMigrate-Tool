import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err.message, err.stack);
  res.status(500).json({
    error: true,
    message: err.message || '内部服务器错误',
  });
}
