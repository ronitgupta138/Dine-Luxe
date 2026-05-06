import { Request, Response, NextFunction } from 'express';
export declare function getMe(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateMe(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getUserById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function checkEmail(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=users.controller.d.ts.map