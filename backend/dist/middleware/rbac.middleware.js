"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = requireRole;
const response_1 = require("../utils/response");
/**
 * Factory that returns middleware enforcing role-based access.
 * Usage: router.get('/admin', authenticate, requireRole('admin', 'owner'), handler)
 */
function requireRole(...roles) {
    return (req, res, next) => {
        const userRole = req.user?.role;
        if (!userRole || !roles.includes(userRole)) {
            res.status(403).json((0, response_1.error)('FORBIDDEN', `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${userRole ?? 'none'}.`));
            return;
        }
        next();
    };
}
//# sourceMappingURL=rbac.middleware.js.map