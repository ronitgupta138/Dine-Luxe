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
exports.signupSuperAdmin = signupSuperAdmin;
exports.createAdmin = createAdmin;
exports.getDashboard = getDashboard;
exports.getPlatformStats = getPlatformStats;
exports.getHealth = getHealth;
exports.getDetailedHealth = getDetailedHealth;
exports.getRestaurants = getRestaurants;
exports.updateRestaurantStatus = updateRestaurantStatus;
exports.getCustomers = getCustomers;
exports.updateCustomerStatus = updateCustomerStatus;
exports.getFeedback = getFeedback;
const adminService = __importStar(require("./admin.service"));
const response_1 = require("../../utils/response");
// POST /admin/signup  (public — protected by X-Seed-Secret and allows multiple super_admin users)
async function signupSuperAdmin(req, res, next) {
    try {
        const data = await adminService.createSuperAdmin(req.body);
        res.status(201).json((0, response_1.success)(data, 'Super admin created. Log in at POST /api/v1/auth/login with your credentials.'));
    }
    catch (err) {
        next(err);
    }
}
// POST /admin/create-admin  (super_admin JWT required)
async function createAdmin(req, res, next) {
    try {
        const data = await adminService.createAdmin(req.body);
        res.status(201).json((0, response_1.success)(data, 'Admin account created successfully.'));
    }
    catch (err) {
        next(err);
    }
}
async function getDashboard(req, res, next) {
    try {
        const data = await adminService.getDashboard();
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getPlatformStats(req, res, next) {
    try {
        const data = await adminService.getPlatformStats();
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getHealth(req, res, next) {
    try {
        const data = await adminService.getHealth();
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getDetailedHealth(req, res, next) {
    try {
        const data = await adminService.getDetailedHealth();
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getRestaurants(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const status = req.query.status;
        const result = await adminService.getRestaurants(page, limit, status);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function updateRestaurantStatus(req, res, next) {
    try {
        const data = await adminService.updateRestaurantStatus(req.params.id, req.body.status);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getCustomers(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const status = req.query.status;
        const result = await adminService.getCustomers(page, limit, status);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function updateCustomerStatus(req, res, next) {
    try {
        const data = await adminService.updateCustomerStatus(req.params.id, req.body.status);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getFeedback(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await adminService.getFeedback(page, limit);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=admin.controller.js.map