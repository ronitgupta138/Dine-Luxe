import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
type ValidationTarget = 'body' | 'query' | 'params';
type ValidationInput = ZodSchema | {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
};
/**
 * Returns middleware that validates req[target] against the given Zod schema.
 * Defaults to validating req.body.
 */
export declare function validate(input: ValidationInput, target?: ValidationTarget): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map