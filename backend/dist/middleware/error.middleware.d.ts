import { Request, Response, NextFunction } from 'express';
export declare function errorHandler(err: Error & {
    status?: number;
    statusCode?: number;
    code?: string;
}, req: Request, res: Response, _next: NextFunction): void;
/** Catches 404s for unregistered routes. */
export declare function notFoundHandler(req: Request, res: Response): void;
//# sourceMappingURL=error.middleware.d.ts.map