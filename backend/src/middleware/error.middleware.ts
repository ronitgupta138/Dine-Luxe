import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import { error } from '../utils/response';
import { config } from '../config/env';

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    config.NODE_ENV === 'development'
      ? winston.format.prettyPrint()
      : winston.format.json(),
  ),
  transports: [new winston.transports.Console()],
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(
  err: Error & { status?: number; statusCode?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const statusCode = err.status ?? err.statusCode ?? 500;
  const isProduction = config.NODE_ENV === 'production';

  logger.error({
    message: err.message,
    code: err.code,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  });

  res.status(statusCode).json(
    error(
      err.code ?? 'INTERNAL_SERVER_ERROR',
      isProduction && statusCode === 500
        ? 'An unexpected error occurred. Please try again later.'
        : err.message,
    ),
  );
}

/** Catches 404s for unregistered routes. */
export function notFoundHandler(req: Request, res: Response): void {
  res
    .status(404)
    .json(error('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}
