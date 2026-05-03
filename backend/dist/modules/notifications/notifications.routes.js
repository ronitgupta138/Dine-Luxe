"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const notifications_controller_1 = require("./notifications.controller");
const notifications_schema_1 = require("./notifications.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// GET /notifications
router.get('/', notifications_controller_1.getNotifications);
// PATCH /notifications/read-all  ← MUST be before /:id/read or Express matches "read-all" as :id
router.patch('/read-all', notifications_controller_1.markAllRead);
// PATCH /notifications/:id/read
router.patch('/:id/read', notifications_controller_1.markRead);
// POST /notifications/register-device
router.post('/register-device', (0, validate_middleware_1.validate)(notifications_schema_1.registerDeviceSchema), notifications_controller_1.registerDevice);
// DELETE /notifications/device/:token
router.delete('/device/:token', notifications_controller_1.removeDevice);
exports.default = router;
//# sourceMappingURL=notifications.routes.js.map