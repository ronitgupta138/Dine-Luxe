"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.error = error;
exports.validationError = validationError;
function success(data, messageOrMeta, meta) {
    const message = typeof messageOrMeta === 'string' ? messageOrMeta : undefined;
    const resolvedMeta = typeof messageOrMeta === 'object' ? messageOrMeta : meta;
    return {
        success: true,
        data,
        ...(message !== undefined && { message }),
        ...(resolvedMeta !== undefined && { meta: resolvedMeta }),
    };
}
function error(codeOrMessage, message, field) {
    const code = message ? codeOrMessage : 'ERROR';
    const resolvedMessage = message ? message : codeOrMessage;
    return {
        success: false,
        error: {
            code,
            message: resolvedMessage,
            ...(field !== undefined && { field }),
        },
    };
}
function validationError(errors) {
    return {
        success: false,
        error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            errors,
        },
    };
}
//# sourceMappingURL=response.js.map