"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const geo_controller_1 = require("./geo.controller");
const router = (0, express_1.Router)();
// POST /geo/arrival-check — authenticated customer only
router.post('/arrival-check', auth_middleware_1.authenticate, geo_controller_1.checkArrival);
exports.default = router;
//# sourceMappingURL=geo.routes.js.map