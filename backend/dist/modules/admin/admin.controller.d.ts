import { Request, Response, NextFunction } from 'express';
export declare function signupSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function createAdmin(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getDashboard(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getPlatformStats(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getHealth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getDetailedHealth(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getRestaurants(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateRestaurantStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getCustomers(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function updateCustomerStatus(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getFeedback(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=admin.controller.d.ts.map