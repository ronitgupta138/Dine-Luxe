import { Request, Response, NextFunction } from 'express'

interface AuthenticatedRequest extends Request {
  user?: {
    role?: string
  }
}

const roleRouteMap: Record<string, string[]> = {
  '/api/admin': ['admin'],
  '/api/owner': ['owner'],
  '/api/staff/manager': ['manager'],
  '/api/staff/host': ['host'],
  '/api/staff/waiter': ['waiter'],
  '/api/staff/chef': ['chef'],
  '/api/staff/cashier': ['cashier'],
}

export function requireRole(role: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (req.user?.role === role) {
      return next()
    }
    return res.status(403).json({ error: 'Forbidden' })
  }
}

export function rbacGuard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const path = req.path
  const userRole = req.user?.role

  for (const prefix in roleRouteMap) {
    if (path.startsWith(prefix)) {
      if (!userRole || !roleRouteMap[prefix].includes(userRole)) {
        return res.status(403).json({ error: 'Forbidden' })
      }
    }
  }

  next()
}
