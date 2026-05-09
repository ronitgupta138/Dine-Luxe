import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { error } from '../utils/response';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  restaurant_id?: string;
  branch_id?: string;
  exp?: number;
  [key: string]: unknown;
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json(error('UNAUTHORIZED', 'Missing or malformed Authorization header'));
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, config.SUPABASE_JWT_SECRET) as JwtPayload;

    req.user = {
      ...decoded,
      id: decoded.sub,
      email: decoded.email ?? '',
      role: decoded.role ?? 'customer',
      restaurant_id: decoded.restaurant_id,
      branch_id: decoded.branch_id,
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // 401 = needs re-authentication. Using 403 here was wrong because it
      // short-circuits before RBAC runs, making role-check tests return 403
      // TOKEN_EXPIRED instead of 403 FORBIDDEN (two different 403 meanings
      // that confuse clients). Clients must re-login on 401.
      res.status(401).json(error('TOKEN_EXPIRED', 'Access token has expired'));
      return;
    }
    res.status(401).json(error('INVALID_TOKEN', 'Invalid access token'));
  }
}
