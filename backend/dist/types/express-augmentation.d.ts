import 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                restaurant_id?: string;
                branch_id?: string;
                [key: string]: unknown;
            };
            restaurantId?: string;
            branchId?: string;
        }
    }
}
export {};
//# sourceMappingURL=express-augmentation.d.ts.map