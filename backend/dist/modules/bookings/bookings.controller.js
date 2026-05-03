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
exports.createBooking = createBooking;
exports.getBookingById = getBookingById;
exports.getMyBookings = getMyBookings;
exports.getBranchBookings = getBranchBookings;
exports.cancelBooking = cancelBooking;
exports.markArrived = markArrived;
exports.markSeated = markSeated;
exports.markNoShow = markNoShow;
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const bookingsService = __importStar(require("./bookings.service"));
async function createBooking(req, res, next) {
    try {
        const data = await bookingsService.createBooking(req.body, req.user.id);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        if (err.statusCode)
            return res.status(err.statusCode).json((0, response_1.error)(err.message));
        next(err);
    }
}
async function getBookingById(req, res, next) {
    try {
        const data = await bookingsService.getBookingById(req.params.id, req.user.id, req.user.role);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        if (err.statusCode)
            return res.status(err.statusCode).json((0, response_1.error)(err.message));
        next(err);
    }
}
async function getMyBookings(req, res, next) {
    try {
        const { data, total, page, limit } = await bookingsService.getMyBookings(req.user.id, req.query);
        res.json((0, response_1.success)(data, (0, pagination_1.buildPaginationMeta)(total, page, limit)));
    }
    catch (err) {
        next(err);
    }
}
async function getBranchBookings(req, res, next) {
    try {
        const { data, total, page, limit } = await bookingsService.getBranchBookings(req.params.branchId, req.query);
        res.json((0, response_1.success)(data, (0, pagination_1.buildPaginationMeta)(total, page, limit)));
    }
    catch (err) {
        next(err);
    }
}
async function cancelBooking(req, res, next) {
    try {
        const data = await bookingsService.cancelBooking(req.params.id, req.body, req.user.id, req.user.role);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        if (err.statusCode)
            return res.status(err.statusCode).json((0, response_1.error)(err.message));
        next(err);
    }
}
async function markArrived(req, res, next) {
    try {
        const data = await bookingsService.markArrived(req.params.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function markSeated(req, res, next) {
    try {
        const data = await bookingsService.markSeated(req.params.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function markNoShow(req, res, next) {
    try {
        const data = await bookingsService.markNoShow(req.params.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=bookings.controller.js.map