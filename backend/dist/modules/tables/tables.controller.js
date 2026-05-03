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
exports.getTablesByBranch = getTablesByBranch;
exports.createTable = createTable;
exports.updateStatus = updateStatus;
exports.mergeTables = mergeTables;
exports.deleteTable = deleteTable;
const response_1 = require("../../utils/response");
const tablesService = __importStar(require("./tables.service"));
// ─── Helper ───────────────────────────────────────────────────────────────────
function handleKnownError(err, res, next) {
    const code = err.statusCode ?? err.status;
    if (code && code >= 400 && code < 500) {
        return res.status(code).json((0, response_1.error)(err.message));
    }
    next(err);
}
// ─── Controllers ─────────────────────────────────────────────────────────────
async function getTablesByBranch(req, res, next) {
    try {
        const data = await tablesService.getTablesByBranch(req.params.branchId);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function createTable(req, res, next) {
    try {
        const data = await tablesService.createTable(req.body);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
async function updateStatus(req, res, next) {
    try {
        const data = await tablesService.updateTableStatus(req.params.id, req.body, req.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        // FIX: original only caught 422; 404 (table not found) also needs explicit response
        handleKnownError(err, res, next);
    }
}
async function mergeTables(req, res, next) {
    try {
        const data = await tablesService.mergeTables(req.body, req.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        // FIX: was missing error handling entirely — merge failures silently 500'd
        handleKnownError(err, res, next);
    }
}
async function deleteTable(req, res, next) {
    try {
        // FIX: original called deleteTable which returned void — result was discarded.
        // Service now returns { deleted: true }; pass it through.
        const result = await tablesService.deleteTable(req.params.id);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        handleKnownError(err, res, next);
    }
}
//# sourceMappingURL=tables.controller.js.map