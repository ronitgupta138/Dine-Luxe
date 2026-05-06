"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const loyalty_controller_1 = require("./loyalty.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /loyalty/balance — returns balance for the authenticated user (own data only)
router.get('/balance', loyalty_controller_1.getBalance);
// POST /loyalty/earn
router.post('/earn', loyalty_controller_1.earnPoints);
// POST /loyalty/redeem
router.post('/redeem', loyalty_controller_1.redeemPoints);
// GET /loyalty/history — returns transaction history for authenticated user only
router.get('/history', loyalty_controller_1.getHistory);
exports.default = router;
//# sourceMappingURL=loyalty.routes.js.map