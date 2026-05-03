"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectTenant = injectTenant;
const response_1 = require("../utils/response");
/**
 * Extracts restaurant_id and branch_id from the decoded JWT (already on req.user)
 * and attaches them to req.restaurantId / req.branchId for downstream use.
 *
 * Must be used AFTER authenticate middleware.
 */
function injectTenant(req, res, next) {
    const restaurantId = req.user?.restaurant_id;
    const branchId = req.user?.branch_id;
    if (!restaurantId) {
        res.status(403).json((0, response_1.error)('NO_TENANT_CONTEXT', 'No restaurant context found in token. Access denied.'));
        return;
    }
    req.restaurantId = restaurantId;
    req.branchId = branchId ?? '';
    next();
}
//# sourceMappingURL=tenant.middleware.js.map