import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

/**
 * Factory that returns middleware enforcing role-based access.
 * Usage: router.get('/admin', authenticate, requireRole('admin', 'owner'), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).user?.role;

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json(
        error(
          'FORBIDDEN',
          `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole ?? 'none'}.`,
        ),
      );
      return;
    }

    next();
  };
}
