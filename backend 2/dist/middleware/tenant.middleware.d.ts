import { Request, Response, NextFunction } from 'express';
/**
 * Extracts restaurant_id and branch_id from the decoded JWT (already on req.user)
 * and attaches them to req.restaurantId / req.branchId for downstream use.
 *
 * Must be used AFTER authenticate middleware.
 */
export declare function injectTenant(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=tenant.middleware.d.ts.map