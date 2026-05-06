"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const response_1 = require("../utils/response");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json((0, response_1.error)('UNAUTHORIZED', 'Missing or malformed Authorization header'));
        return;
    }
    const token = authHeader.slice(7);
    try {
        const decoded = jsonwebtoken_1.default.verify(token, env_1.config.SUPABASE_JWT_SECRET);
        req.user = {
            ...decoded,
            id: decoded.sub,
            email: decoded.email ?? '',
            role: decoded.role ?? 'customer',
            restaurant_id: decoded.restaurant_id,
            branch_id: decoded.branch_id,
        };
        next();
    }
    catch (err) {
        if (err instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(403).json((0, response_1.error)('TOKEN_EXPIRED', 'Access token has expired'));
            return;
        }
        res.status(401).json((0, response_1.error)('INVALID_TOKEN', 'Invalid access token'));
    }
}
//# sourceMappingURL=auth.middleware.js.map