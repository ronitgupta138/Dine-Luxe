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
exports.register = register;
exports.getAll = getAll;
exports.getNearby = getNearby;
exports.getById = getById;
exports.getLiveStatus = getLiveStatus;
exports.update = update;
exports.updateStatus = updateStatus;
const restaurantsService = __importStar(require("./restaurants.service"));
const response_1 = require("../../utils/response");
// POST /restaurants/register  (public — owner onboarding)
async function register(req, res, next) {
    try {
        const ip = req.ip ?? 'unknown';
        const result = await restaurantsService.register(req.body, ip);
        res.status(201).json((0, response_1.success)(result, 'Restaurant registered — pending approval'));
    }
    catch (err) {
        next(err);
    }
}
// GET /restaurants  (admin only)
async function getAll(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const status = req.query.status;
        const result = await restaurantsService.getAll(page, limit, status);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
// GET /restaurants/nearby?lat=&lon=&radius=  (public)
async function getNearby(req, res, next) {
    try {
        const lat = parseFloat(req.query.lat);
        const lon = parseFloat(req.query.lon);
        const radius = parseFloat(req.query.radius) || 10;
        if (isNaN(lat) || isNaN(lon)) {
            return res.status(400).json((0, response_1.error)('VALIDATION_ERROR', 'lat and lon are required'));
        }
        const restaurants = await restaurantsService.getNearby(lat, lon, radius);
        res.json((0, response_1.success)(restaurants));
    }
    catch (err) {
        next(err);
    }
}
// GET /restaurants/:id  (public)
async function getById(req, res, next) {
    try {
        const restaurant = await restaurantsService.getById(req.params.id);
        res.json((0, response_1.success)(restaurant));
    }
    catch (err) {
        next(err);
    }
}
// GET /restaurants/:id/live-status  (public)
async function getLiveStatus(req, res, next) {
    try {
        const status = await restaurantsService.getLiveStatus(req.params.id);
        res.json((0, response_1.success)(status));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /restaurants/:id  (owner only)
async function update(req, res, next) {
    try {
        const updated = await restaurantsService.update(req.params.id, req.body);
        res.json((0, response_1.success)(updated, 'Restaurant updated'));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /restaurants/:id/status  (admin only)
async function updateStatus(req, res, next) {
    try {
        const authReq = req;
        const updated = await restaurantsService.updateStatus(req.params.id, req.body, authReq.user.id, req.ip ?? 'unknown');
        res.json((0, response_1.success)(updated, 'Status updated'));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=restaurants.controller.js.map