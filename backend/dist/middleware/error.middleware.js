"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
const winston_1 = __importDefault(require("winston"));
const response_1 = require("../utils/response");
const env_1 = require("../config/env");
const logger = winston_1.default.createLogger({
    level: 'error',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.errors({ stack: true }), env_1.config.NODE_ENV === 'development'
        ? winston_1.default.format.prettyPrint()
        : winston_1.default.format.json()),
    transports: [new winston_1.default.transports.Console()],
});
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function errorHandler(err, req, res, _next) {
    const statusCode = err.status ?? err.statusCode ?? 500;
    const isProduction = env_1.config.NODE_ENV === 'production';
    logger.error({
        message: err.message,
        code: err.code,
        stack: err.stack,
        method: req.method,
        url: req.originalUrl,
        statusCode,
    });
    res.status(statusCode).json((0, response_1.error)(err.code ?? 'INTERNAL_SERVER_ERROR', isProduction && statusCode === 500
        ? 'An unexpected error occurred. Please try again later.'
        : err.message));
}
/** Catches 404s for unregistered routes. */
function notFoundHandler(req, res) {
    res
        .status(404)
        .json((0, response_1.error)('NOT_FOUND', `Route ${req.method} ${req.originalUrl} not found`));
}
//# sourceMappingURL=error.middleware.js.map