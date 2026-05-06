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
exports.getNotifications = getNotifications;
exports.markRead = markRead;
exports.markAllRead = markAllRead;
exports.registerDevice = registerDevice;
exports.removeDevice = removeDevice;
const notificationsService = __importStar(require("./notifications.service"));
const response_1 = require("../../utils/response");
async function getNotifications(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await notificationsService.getForUser(req.user.id, page, limit);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function markRead(req, res, next) {
    try {
        const data = await notificationsService.markRead(req.params.id, req.user.id);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function markAllRead(req, res, next) {
    try {
        await notificationsService.markAllRead(req.user.id);
        res.json((0, response_1.success)({ message: 'All notifications marked as read' }));
    }
    catch (err) {
        next(err);
    }
}
async function registerDevice(req, res, next) {
    try {
        const { token, platform } = req.body;
        const data = await notificationsService.registerDevice(req.user.id, token, platform);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function removeDevice(req, res, next) {
    try {
        await notificationsService.removeDevice(req.user.id, req.params.token);
        res.json((0, response_1.success)({ message: 'Device token removed' }));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=notifications.controller.js.map