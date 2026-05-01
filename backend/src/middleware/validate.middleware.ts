import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { validationError } from '../utils/response';

type ValidationTarget = 'body' | 'query' | 'params';

/**
 * Returns middleware that validates req[target] against the given Zod schema.
 * Defaults to validating req.body.
 */
export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json(validationError(errors));
      return;
    }

    // Replace the target with the parsed (and coerced) value
    // cast to any to satisfy TypeScript index signature for express Request
    (req as any)[target] = result.data;
    next();
  };
}
