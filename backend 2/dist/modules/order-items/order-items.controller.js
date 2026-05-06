"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetOrderItems = handleGetOrderItems;
exports.handleServeItem = handleServeItem;
exports.handleUpdateItemStatus = handleUpdateItemStatus;
const response_1 = require("../../utils/response");
const order_items_service_1 = require("./order-items.service");
async function handleGetOrderItems(req, res, next) {
    try {
        const items = await (0, order_items_service_1.getOrderItems)(req.params.orderId, req.branchId);
        res.json((0, response_1.success)(items));
    }
    catch (err) {
        next(err);
    }
}
async function handleServeItem(req, res, next) {
    try {
        const result = await (0, order_items_service_1.serveItem)(req.params.id, req.branchId);
        res.json((0, response_1.success)(result, 'Item marked as served'));
    }
    catch (err) {
        next(err);
    }
}
async function handleUpdateItemStatus(req, res, next) {
    try {
        const result = await (0, order_items_service_1.updateItemStatus)(req.params.id, req.branchId, req.body.status);
        res.json((0, response_1.success)(result, 'Item status updated'));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=order-items.controller.js.map