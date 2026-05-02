import { Request, Response, NextFunction } from 'express';
import * as usersService from './users.service';
import { success, error } from '../../utils/response';

type AuthenticatedRequest = Request & {
  user: { id: string; branch_id?: string; role: string; restaurant_id?: string };
  restaurantId: string;
  branchId: string;
};

// GET /users/me
export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const profile = await usersService.getMe(authReq.user!.id);
    res.json(success(profile, 'Profile fetched'));
  } catch (err) {
    next(err);
  }
}

// PATCH /users/me
export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;
    const updated = await usersService.updateMe(authReq.user!.id, req.body);
    res.json(success(updated, 'Profile updated'));
  } catch (err) {
    next(err);
  }
}

// GET /users/:id  (manager/owner/admin)
export async function getUserById(req: Request, res: Response, next: NextFunction) {
  try {
    const authReq = req as AuthenticatedRequest;

    // BUG FIX: restaurantId came from req.restaurantId (set by injectTenant),
    // but the routes file does NOT apply injectTenant for /:id — the route only
    // uses authenticate + requireRole. Fall back to user.restaurant_id from JWT.
    const restaurantId = authReq.restaurantId || authReq.user?.restaurant_id;
    if (!restaurantId) {
      return res
        .status(400)
        .json(error('VALIDATION_ERROR', 'Restaurant context is required'));
    }

    const user = await usersService.getUserById(req.params.id, restaurantId);
    res.json(success(user, 'User fetched'));
  } catch (err) {
    next(err);
  }
}

// GET /users/check-email?email=
export async function checkEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const email = req.query.email as string;

    // BUG FIX: original returned a plain string error (not the ErrorResponse
    // shape) — use the error() helper for a consistent API response shape.
    if (!email || !email.trim()) {
      return res
        .status(400)
        .json(error('VALIDATION_ERROR', 'email query parameter is required'));
    }

    const result = await usersService.checkEmail(email);
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}
