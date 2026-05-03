"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleAssignDelivery = handleAssignDelivery;
exports.handleGetDelivery = handleGetDelivery;
exports.handleUpdateDeliveryStatus = handleUpdateDeliveryStatus;
exports.handleUpdateLocation = handleUpdateLocation;
exports.handleGetActiveDelivery = handleGetActiveDelivery;
exports.handleGetEarnings = handleGetEarnings;
const response_1 = require("../../utils/response");
const delivery_service_1 = require("./delivery.service");
async function handleAssignDelivery(req, res, next) {
    try {
        const delivery = await (0, delivery_service_1.assignDelivery)(req.params.orderId, req.branchId, req.restaurantId);
        res.status(201).json((0, response_1.success)(delivery, 'Delivery assigned'));
    }
    catch (err) {
        next(err);
    }
}
async function handleGetDelivery(req, res, next) {
    try {
        const delivery = await (0, delivery_service_1.getDelivery)(req.params.id, req.user.id);
        res.json((0, response_1.success)(delivery));
    }
    catch (err) {
        next(err);
    }
}
async function handleUpdateDeliveryStatus(req, res, next) {
    try {
        const delivery = await (0, delivery_service_1.updateDeliveryStatus)(req.params.id, req.user.id, req.body.status);
        res.json((0, response_1.success)(delivery, 'Status updated'));
    }
    catch (err) {
        next(err);
    }
}
async function handleUpdateLocation(req, res, next) {
    try {
        const result = await (0, delivery_service_1.updatePartnerLocation)(req.user.id, req.body.lat, req.body.lon, req.body.delivery_id);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function handleGetActiveDelivery(req, res, next) {
    try {
        const delivery = await (0, delivery_service_1.getActiveDelivery)(req.user.id);
        res.json((0, response_1.success)(delivery));
    }
    catch (err) {
        next(err);
    }
}
async function handleGetEarnings(req, res, next) {
    try {
        const earnings = await (0, delivery_service_1.getPartnerEarnings)(req.user.id);
        res.json((0, response_1.success)(earnings));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=delivery.controller.js.map