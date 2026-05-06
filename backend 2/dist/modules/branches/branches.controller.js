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
exports.getAll = getAll;
exports.create = create;
exports.getById = getById;
exports.update = update;
exports.toggleStatus = toggleStatus;
exports.getLiveStats = getLiveStats;
const branchesService = __importStar(require("./branches.service"));
const response_1 = require("../../utils/response");
// GET /branches
async function getAll(req, res, next) {
    try {
        const authReq = req;
        const branches = await branchesService.getAll(authReq.restaurantId);
        res.json((0, response_1.success)(branches));
    }
    catch (err) {
        next(err);
    }
}
// POST /branches
async function create(req, res, next) {
    try {
        const authReq = req;
        const branch = await branchesService.create(authReq.restaurantId, req.body, authReq.user.id, req.ip ?? 'unknown');
        res.status(201).json((0, response_1.success)(branch, 'Branch created'));
    }
    catch (err) {
        next(err);
    }
}
// GET /branches/:id
async function getById(req, res, next) {
    try {
        const authReq = req;
        const branch = await branchesService.getById(req.params.id, authReq.restaurantId);
        res.json((0, response_1.success)(branch));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /branches/:id
async function update(req, res, next) {
    try {
        const authReq = req;
        const branch = await branchesService.update(req.params.id, authReq.restaurantId, req.body);
        res.json((0, response_1.success)(branch, 'Branch updated'));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /branches/:id/status
async function toggleStatus(req, res, next) {
    try {
        const authReq = req;
        const branch = await branchesService.toggleStatus(req.params.id, authReq.restaurantId, req.body, authReq.user.id, req.ip ?? 'unknown');
        res.json((0, response_1.success)(branch, 'Branch status updated'));
    }
    catch (err) {
        next(err);
    }
}
// GET /branches/:id/live-stats
async function getLiveStats(req, res, next) {
    try {
        const authReq = req;
        const stats = await branchesService.getLiveStats(req.params.id, authReq.restaurantId);
        res.json((0, response_1.success)(stats));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=branches.controller.js.map