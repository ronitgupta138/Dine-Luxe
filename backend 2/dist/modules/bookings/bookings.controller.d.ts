import { Request, Response, NextFunction } from 'express';
export declare function createBooking(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getBookingById(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getMyBookings(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function getBranchBookings(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function cancelBooking(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
export declare function markArrived(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markSeated(req: Request, res: Response, next: NextFunction): Promise<void>;
export declare function markNoShow(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=bookings.controller.d.ts.map