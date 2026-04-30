"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
exports.rbacGuard = rbacGuard;
const roleRouteMap = {
    '/api/admin': ['admin'],
    '/api/owner': ['owner'],
    '/api/staff/manager': ['manager'],
    '/api/staff/host': ['host'],
    '/api/staff/waiter': ['waiter'],
    '/api/staff/chef': ['chef'],
    '/api/staff/cashier': ['cashier'],
};
function requireRole(role) {
    return (req, res, next) => {
        if (req.user?.role === role) {
            return next();
        }
        return res.status(403).json({ error: 'Forbidden' });
    };
}
function rbacGuard(req, res, next) {
    const path = req.path;
    const userRole = req.user?.role;
    for (const prefix in roleRouteMap) {
        if (path.startsWith(prefix)) {
            if (!userRole || !roleRouteMap[prefix].includes(userRole)) {
                return res.status(403).json({ error: 'Forbidden' });
            }
        }
    }
    next();
}
