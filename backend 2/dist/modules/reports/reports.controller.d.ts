import { Request, Response, NextFunction } from 'express';
export declare function getSales(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getMenuPerformance(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getKitchenPerformance(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getCustomerInsights(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getAdminPlatform(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getAdminTrends(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function exportReport(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=reports.controller.d.ts.map