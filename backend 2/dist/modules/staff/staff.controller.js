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
exports.getByBranch = getByBranch;
exports.create = create;
exports.getById = getById;
exports.update = update;
exports.toggleAccess = toggleAccess;
exports.getPerformance = getPerformance;
const staffService = __importStar(require("./staff.service"));
const response_1 = require("../../utils/response");
// GET /staff/branch/:branchId
async function getByBranch(req, res, next) {
    try {
        const authReq = req;
        const staff = await staffService.getByBranch(req.params.branchId, authReq.restaurantId);
        res.json((0, response_1.success)(staff));
    }
    catch (err) {
        next(err);
    }
}
// POST /staff/create
async function create(req, res, next) {
    try {
        const authReq = req;
        const staff = await staffService.create(req.body, authReq.restaurantId, authReq.user.id, authReq.user.branch_id ?? '', authReq.user.role, req.ip ?? 'unknown');
        res.status(201).json((0, response_1.success)(staff, 'Staff account created'));
    }
    catch (err) {
        next(err);
    }
}
// GET /staff/:id
async function getById(req, res, next) {
    try {
        const authReq = req;
        const staff = await staffService.getById(req.params.id, authReq.restaurantId);
        res.json((0, response_1.success)(staff));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /staff/:id
async function update(req, res, next) {
    try {
        const authReq = req;
        const staff = await staffService.update(req.params.id, authReq.restaurantId, req.body);
        res.json((0, response_1.success)(staff, 'Staff updated'));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /staff/:id/toggle-access
async function toggleAccess(req, res, next) {
    try {
        const authReq = req;
        const staff = await staffService.toggleAccess(req.params.id, authReq.restaurantId, authReq.user.id, req.ip ?? 'unknown');
        res.json((0, response_1.success)(staff, `Access ${staff.is_active ? 'enabled' : 'disabled'}`));
    }
    catch (err) {
        next(err);
    }
}
// GET /staff/:id/performance
async function getPerformance(req, res, next) {
    try {
        const authReq = req;
        const perf = await staffService.getPerformance(req.params.id, authReq.restaurantId);
        res.json((0, response_1.success)(perf));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=staff.controller.js.map