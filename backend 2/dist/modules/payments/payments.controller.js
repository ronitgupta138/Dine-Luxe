"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleInitiatePayment = handleInitiatePayment;
exports.handleVerifyPayment = handleVerifyPayment;
exports.handleGenerateUPIQR = handleGenerateUPIQR;
exports.handlePollUPIStatus = handlePollUPIStatus;
exports.handleSplitBill = handleSplitBill;
exports.handleGetReceipt = handleGetReceipt;
exports.handleGatewayWebhookController = handleGatewayWebhookController;
const response_1 = require("../../utils/response");
const payments_service_1 = require("./payments.service");
async function handleInitiatePayment(req, res, next) {
    try {
        const result = await (0, payments_service_1.initiatePayment)(req.body, req.branchId, req.restaurantId);
        res.status(201).json((0, response_1.success)(result, 'Payment initiated'));
    }
    catch (err) {
        next(err);
    }
}
async function handleVerifyPayment(req, res, next) {
    try {
        const result = await (0, payments_service_1.verifyPayment)(req.body, req.branchId);
        res.json((0, response_1.success)(result, 'Payment verified'));
    }
    catch (err) {
        next(err);
    }
}
async function handleGenerateUPIQR(req, res, next) {
    try {
        const result = await (0, payments_service_1.generateUPIQR)(req.body, req.branchId);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function handlePollUPIStatus(req, res, next) {
    try {
        const result = await (0, payments_service_1.pollUPIStatus)(req.params.ref, req.branchId);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function handleSplitBill(req, res, next) {
    try {
        const result = await (0, payments_service_1.splitBill)(req.body, req.branchId, req.restaurantId);
        res.status(201).json((0, response_1.success)(result, 'Split created'));
    }
    catch (err) {
        next(err);
    }
}
async function handleGetReceipt(req, res, next) {
    try {
        const result = await (0, payments_service_1.getReceipt)(req.params.orderId, req.branchId);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function handleGatewayWebhookController(req, res, next) {
    try {
        // TODO: Pass raw body for signature verification (configure express.raw() on this route)
        const result = await (0, payments_service_1.handleGatewayWebhook)(req.body);
        res.json(result);
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=payments.controller.js.map