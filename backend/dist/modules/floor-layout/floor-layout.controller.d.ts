import { Request, Response, NextFunction } from 'express';
export declare function getLayout(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function saveDraft(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function publishLayout(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getLiveLayout(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=floor-layout.controller.d.ts.map