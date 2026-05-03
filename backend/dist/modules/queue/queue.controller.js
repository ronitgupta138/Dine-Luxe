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
exports.joinQueue = joinQueue;
exports.getBranchQueue = getBranchQueue;
exports.getQueuePosition = getQueuePosition;
exports.markArrived = markArrived;
exports.assignTable = assignTable;
exports.markNoShow = markNoShow;
exports.removeFromQueue = removeFromQueue;
const response_1 = require("../../utils/response");
const pagination_1 = require("../../utils/pagination");
const queueService = __importStar(require("./queue.service"));
// ─── Helper: forward known HTTP errors, pass unknown ones to global handler ───
function handleKnownError(err, res, next) {
    const code = err.statusCode ?? err.status;
    if (code && code >= 400 && code < 500) {
        return res.status(code).json((0, response_1.error)(err.message));
    }
    next(err);
}
// ─── Controllers ─────────────────────────────────────────────────────────────
async function joinQueue(req, res, next) {
    try {
        // FIX: validate required fields before hitting the service
        const { branch_id, people_count } = req.body;
        if (!branch_id)
            return res.status(400).json((0, response_1.error)('branch_id is required'));
        if (!people_count)
            return res.status(400).json((0, response_1.error)('people_count is required'));
        const data = await queueService.joinQueue({ ...req.body, user_id: req.user?.id });
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function getBranchQueue(req, res, next) {
    try {
        const { data, total, page, limit } = await queueService.getBranchQueue(req.params.branchId, req.query);
        res.json((0, response_1.success)(data, (0, pagination_1.buildPaginationMeta)(total, page, limit)));
    }
    catch (err) {
        next(err);
    }
}
async function getQueuePosition(req, res, next) {
    try {
        const data = await queueService.getQueuePosition(req.params.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function markArrived(req, res, next) {
    try {
        const data = await queueService.markQueueArrived(req.params.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function assignTable(req, res, next) {
    try {
        const { table_id } = req.body;
        if (!table_id)
            return res.status(400).json((0, response_1.error)('table_id is required'));
        const data = await queueService.assignTable(req.params.id, table_id, req.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function markNoShow(req, res, next) {
    try {
        const data = await queueService.markQueueNoShow(req.params.id);
        // FIX: was returning success(data) but service previously returned {removed:true}
        // Service now returns the updated row — wrap correctly
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function removeFromQueue(req, res, next) {
    try {
        const data = await queueService.removeFromQueue(req.params.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
//# sourceMappingURL=queue.controller.js.map