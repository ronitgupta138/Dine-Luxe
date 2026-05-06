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
exports.getMenuSuggestions = getMenuSuggestions;
exports.getDemandForecast = getDemandForecast;
exports.getBundleOpportunities = getBundleOpportunities;
exports.getStaffingRecommendation = getStaffingRecommendation;
const analyticsService = __importStar(require("./analytics.service"));
const response_1 = require("../../utils/response");
async function getMenuSuggestions(req, res, next) {
    try {
        const data = await analyticsService.getMenuSuggestions(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getDemandForecast(req, res, next) {
    try {
        const data = await analyticsService.getDemandForecast(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getBundleOpportunities(req, res, next) {
    try {
        const data = await analyticsService.getBundleOpportunities(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getStaffingRecommendation(req, res, next) {
    try {
        const data = await analyticsService.getStaffingRecommendation(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=analytics.controller.js.map