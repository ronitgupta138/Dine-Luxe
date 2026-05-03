import { Request, Response, NextFunction } from 'express';
/**
 * Factory that returns middleware enforcing role-based access.
 * Usage: router.get('/admin', authenticate, requireRole('admin', 'owner'), handler)
 */
export declare function requireRole(...roles: string[]): (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=rbac.middleware.d.ts.map