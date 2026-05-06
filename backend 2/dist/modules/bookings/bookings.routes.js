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
const bookings_schema_1 = require("./bookings.schema");
const ctrl = __importStar(require("./bookings.controller"));
const router = (0, express_1.Router)();
// POST /bookings — customer
router.post('/', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('customer'), (0, validate_middleware_1.validate)({ body: bookings_schema_1.createBookingSchema }), ctrl.createBooking);
// GET /bookings/user/me — customer's own bookings (must come before /:id)
router.get('/user/me', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('customer'), ctrl.getMyBookings);
// GET /bookings/branch/:branchId — host/manager view of today's bookings
router.get('/branch/:branchId', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager', 'owner'), ctrl.getBranchBookings);
// GET /bookings/:id — customer or staff
router.get('/:id', auth_middleware_1.authenticate, ctrl.getBookingById);
// PATCH /bookings/:id/cancel — customer or manager
router.patch('/:id/cancel', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)({ body: bookings_schema_1.cancelBookingSchema }), ctrl.cancelBooking);
// PATCH /bookings/:id/arrived — host or customer
router.patch('/:id/arrived', auth_middleware_1.authenticate, ctrl.markArrived);
// PATCH /bookings/:id/seat — host only
router.patch('/:id/seat', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager'), ctrl.markSeated);
// PATCH /bookings/:id/no-show — host only
router.patch('/:id/no-show', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('host', 'manager'), ctrl.markNoShow);
exports.default = router;
//# sourceMappingURL=bookings.routes.js.map