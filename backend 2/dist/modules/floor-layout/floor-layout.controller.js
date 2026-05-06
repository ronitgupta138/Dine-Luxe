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
exports.getLayout = getLayout;
exports.saveDraft = saveDraft;
exports.publishLayout = publishLayout;
exports.getLiveLayout = getLiveLayout;
const response_1 = require("../../utils/response");
const floorService = __importStar(require("./floor-layout.service"));
async function getLayout(req, res, next) {
    try {
        const data = await floorService.getLayout(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function saveDraft(req, res, next) {
    try {
        const data = await floorService.saveDraft(req.params.branchId, req.body, req.user.id);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function publishLayout(req, res, next) {
    try {
        const { layout_version } = req.body;
        if (typeof layout_version !== 'number') {
            return res.status(400).json((0, response_1.error)('layout_version (number) is required for optimistic locking'));
        }
        const data = await floorService.publishLayout(req.params.branchId, layout_version);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        if (err.statusCode === 409)
            return res.status(409).json((0, response_1.error)(err.message));
        next(err);
    }
}
async function getLiveLayout(req, res, next) {
    try {
        const data = await floorService.getLiveLayout(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=floor-layout.controller.js.map