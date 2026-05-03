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
exports.getBranding = getBranding;
exports.updateBranding = updateBranding;
exports.getUploadUrl = getUploadUrl;
const brandingService = __importStar(require("./branding.service"));
const response_1 = require("../../utils/response");
// GET /restaurants/:id/branding  (public — customer app calls this on launch)
async function getBranding(req, res, next) {
    try {
        const branding = await brandingService.getBranding(req.params.id);
        res.json((0, response_1.success)(branding));
    }
    catch (err) {
        next(err);
    }
}
// PATCH /restaurants/:id/branding  (owner only)
async function updateBranding(req, res, next) {
    try {
        const updated = await brandingService.updateBranding(req.params.id, req.body);
        res.json((0, response_1.success)(updated, 'Branding updated'));
    }
    catch (err) {
        next(err);
    }
}
// POST /restaurants/:id/branding/upload-url  (owner only)
async function getUploadUrl(req, res, next) {
    try {
        const result = await brandingService.getUploadUrl(req.params.id, req.body);
        res.json((0, response_1.success)(result, 'Upload URL generated'));
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=branding.controller.js.map