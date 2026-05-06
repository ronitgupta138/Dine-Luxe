"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const reviews_controller_1 = require("./reviews.controller");
const reviews_schema_1 = require("./reviews.schema");
const router = (0, express_1.Router)();
// POST /reviews — customer only, after order
router.post('/', auth_middleware_1.authenticate, (0, validate_middleware_1.validate)(reviews_schema_1.createReviewSchema), reviews_controller_1.createReview);
// GET /reviews/restaurant/:id — public, paginated
router.get('/restaurant/:id', reviews_controller_1.getByRestaurant);
// GET /reviews/branch/:id — public, paginated
router.get('/branch/:id', reviews_controller_1.getByBranch);
// GET /reviews/order/:orderId — check if already reviewed
router.get('/order/:orderId', auth_middleware_1.authenticate, reviews_controller_1.getByOrder);
// DELETE /reviews/:id — admin only
router.delete('/:id', auth_middleware_1.authenticate, (0, rbac_middleware_1.requireRole)('admin'), reviews_controller_1.deleteReview);
exports.default = router;
//# sourceMappingURL=reviews.routes.js.map