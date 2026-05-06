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
exports.createTicket = createTicket;
exports.getTickets = getTickets;
exports.getTicketById = getTicketById;
exports.updateTicketStatus = updateTicketStatus;
exports.postMessage = postMessage;
exports.getMessages = getMessages;
const supportService = __importStar(require("./support.service"));
const response_1 = require("../../utils/response");
async function createTicket(req, res, next) {
    try {
        const data = await supportService.createTicket(req.user.id, req.body);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getTickets(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 20;
        const result = await supportService.getTickets(req.user.id, req.user.role, page, limit);
        res.json((0, response_1.success)(result));
    }
    catch (err) {
        next(err);
    }
}
async function getTicketById(req, res, next) {
    try {
        const data = await supportService.getTicketById(req.params.id, req.user.id, req.user.role);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function updateTicketStatus(req, res, next) {
    try {
        const { status, resolution_note } = req.body;
        const data = await supportService.updateTicketStatus(req.params.id, req.user.id, status, resolution_note);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function postMessage(req, res, next) {
    try {
        const { message, attachments } = req.body;
        const data = await supportService.postMessage(req.params.id, req.user.id, req.user.role, message, attachments);
        res.status(201).json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
async function getMessages(req, res, next) {
    try {
        const data = await supportService.getMessages(req.params.id, req.user.id, req.user.role);
        res.json((0, response_1.success)(data));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=support.controller.js.map