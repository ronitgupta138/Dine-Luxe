"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const rbac_middleware_1 = require("../../middleware/rbac.middleware");
const validate_middleware_1 = require("../../middleware/validate.middleware");
const support_controller_1 = require("./support.controller");
const support_schema_1 = require("./support.schema");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
// POST /support/tickets — customer
router.post('/tickets', (0, validate_middleware_1.validate)(support_schema_1.createTicketSchema), support_controller_1.createTicket);
// GET /support/tickets — customer sees their own
router.get('/tickets', support_controller_1.getTickets);
// GET /support/tickets/:id — customer or support agent
router.get('/tickets/:id', support_controller_1.getTicketById);
// PATCH /support/tickets/:id/status — support agent only
router.patch('/tickets/:id/status', (0, rbac_middleware_1.requireRole)('support', 'admin'), (0, validate_middleware_1.validate)(support_schema_1.updateTicketStatusSchema), support_controller_1.updateTicketStatus);
// POST /support/tickets/:id/messages — customer or agent
router.post('/tickets/:id/messages', (0, validate_middleware_1.validate)(support_schema_1.postMessageSchema), support_controller_1.postMessage);
// GET /support/tickets/:id/messages — customer or agent
router.get('/tickets/:id/messages', support_controller_1.getMessages);
exports.default = router;
//# sourceMappingURL=support.routes.js.map