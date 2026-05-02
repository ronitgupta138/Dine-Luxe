import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { validationError } from '../utils/response';

type ValidationTarget = 'body' | 'query' | 'params';

type ValidationInput =
  | ZodSchema
  | {
      body?: ZodSchema;
      query?: ZodSchema;
      params?: ZodSchema;
    };

function resolveValidationInput(input: ValidationInput): [ZodSchema, ValidationTarget] {
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
export function validate(input: ValidationInput, target: ValidationTarget = 'body') {
  const [schema, resolvedTarget] = resolveValidationInput(input);

  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[resolvedTarget]);

    if (!result.success) {
      const errors = (result.error as ZodError).issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));

      res.status(400).json(validationError(errors));
      return;
    }

    // Replace the target with the parsed (and coerced) value
<<<<<<< HEAD
    // cast to any to satisfy TypeScript index signature for express Request
    (req as any)[target] = result.data;
=======
    (req as unknown as Record<string, unknown>)[resolvedTarget] = result.data;
>>>>>>> 1e4fe1a (Fix Some of the Backend V1.1)
    next();
  };
}
