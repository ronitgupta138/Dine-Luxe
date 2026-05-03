"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const response_1 = require("../utils/response");
function resolveValidationInput(input) {
    if (typeof input === 'object' && 'safeParse' in input) {
        return [input, 'body'];
    }
    if ('body' in input && input.body) {
        return [input.body, 'body'];
    }
    if ('query' in input && input.query) {
        return [input.query, 'query'];
    }
    if ('params' in input && input.params) {
        return [input.params, 'params'];
    }
    throw new Error('Invalid validation schema provided');
}
/**
 * Returns middleware that validates req[target] against the given Zod schema.
 * Defaults to validating req.body.
 */
function validate(input, target = 'body') {
    const [schema, resolvedTarget] = resolveValidationInput(input);
    return (req, res, next) => {
        const result = schema.safeParse(req[resolvedTarget]);
        if (!result.success) {
            const errors = result.error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            }));
            res.status(400).json((0, response_1.validationError)(errors));
            return;
        }
        // Replace the target with the parsed (and coerced) value
        req[resolvedTarget] = result.data;
        next();
    };
}
//# sourceMappingURL=validate.middleware.js.map