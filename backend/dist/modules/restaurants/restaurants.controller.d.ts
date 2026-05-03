import { Request, Response, NextFunction } from 'express';
export declare function register(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAll(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getNearby(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getById(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getLiveStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function update(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=restaurants.controller.d.ts.map