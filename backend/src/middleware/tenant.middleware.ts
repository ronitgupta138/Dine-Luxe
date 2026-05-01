import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/response';

/**
 * Extracts restaurant_id and branch_id from the decoded JWT (already on req.user)
 * and attaches them to req.restaurantId / req.branchId for downstream use.
 *
 * Must be used AFTER authenticate middleware.
 */
export function injectTenant(req: Request, res: Response, next: NextFunction): void {
  const restaurantId = req.user?.restaurant_id;
  const branchId = req.user?.branch_id;

  if (!restaurantId) {
    res.status(403).json(
      error('NO_TENANT_CONTEXT', 'No restaurant context found in token. Access denied.'),
    );
    return;
  }

  req.restaurantId = restaurantId;
  req.branchId = branchId ?? '';

  next();
}
