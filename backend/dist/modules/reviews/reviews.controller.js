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
exports.createReview = createReview;
exports.getByRestaurant = getByRestaurant;
exports.getByBranch = getByBranch;
exports.getByOrder = getByOrder;
exports.deleteReview = deleteReview;
const reviewsService = __importStar(require("./reviews.service"));
const response_1 = require("../../utils/response");
async function createReview(req, res, next) {
    try {
        const data = await reviewsService.create(req.user.id, req.body);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getByRestaurant(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const minRating = req.query.min_rating ? Number(req.query.min_rating) : undefined;
        const maxRating = req.query.max_rating ? Number(req.query.max_rating) : undefined;
        const result = await reviewsService.getByRestaurant(req.params.id, page, limit, minRating, maxRating);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function getByBranch(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await reviewsService.getByBranch(req.params.id, page, limit);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function getByOrder(req, res, next) {
    try {
        const data = await reviewsService.getByOrder(req.params.orderId, req.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function deleteReview(req, res, next) {
    try {
        await reviewsService.deleteReview(req.params.id);
        res.json((0, response_1.success)({ message: 'Review deleted' }));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=reviews.controller.js.map