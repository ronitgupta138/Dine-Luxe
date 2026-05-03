import { Request, Response, NextFunction } from 'express';
export declare function handleInitiatePayment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function handleVerifyPayment(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function handleGenerateUPIQR(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function handlePollUPIStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function handleSplitBill(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function handleGetReceipt(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function handleGatewayWebhookController(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=payments.controller.d.ts.map