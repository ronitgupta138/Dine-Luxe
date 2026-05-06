import { Request, Response, NextFunction } from 'express';
export declare function getBalance(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function earnPoints(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function redeemPoints(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getHistory(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=loyalty.controller.d.ts.map