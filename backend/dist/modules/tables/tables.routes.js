"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const tables_schema_1 = require("./tables.schema");
const ctrl = __importStar(require("./tables.controller"));
const router = (0, express_1.Router)();
// GET /tables/branch/:branchId — any authenticated staff
router.get('/branch/:branchId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner', 'waiter', 'chef', 'cashier'), ctrl.getTablesByBranch);
// POST /tables/merge — must be BEFORE /:id routes to prevent param collision
// BUG FIX: validate({ body: mergeSchema }) was passing a plain object not a
// ZodSchema — validate middleware calls schema.safeParse() which doesn't exist
// on a plain object. Fixed to pass schema directly: validate(mergeSchema).
router.post('/merge', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('manager', 'owner', 'host'), (0, validate_middleware_1.validate)(tables_schema_1.mergeSchema), ctrl.mergeTables);
// POST /tables — manager or owner only
// BUG FIX: same validate wrapping issue fixed here too.
router.post('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('manager', 'owner'), (0, validate_middleware_1.validate)(tables_schema_1.createTableSchema), ctrl.createTable);
// PATCH /tables/:id/status
// BUG FIX: same validate wrapping issue fixed here too.
router.patch('/:id/status', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner', 'waiter'), (0, validate_middleware_1.validate)(tables_schema_1.updateStatusSchema), ctrl.updateStatus);
// DELETE /tables/:id — manager or owner
router.delete('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('manager', 'owner'), ctrl.deleteTable);
exports.default = router;
//# sourceMappingURL=tables.routes.js.map