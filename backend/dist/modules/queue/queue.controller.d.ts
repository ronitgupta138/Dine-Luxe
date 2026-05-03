import { Request, Response, NextFunction } from 'express';
export declare function joinQueue(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getBranchQueue(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getQueuePosition(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markArrived(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function assignTable(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function markNoShow(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function removeFromQueue(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=queue.controller.d.ts.map