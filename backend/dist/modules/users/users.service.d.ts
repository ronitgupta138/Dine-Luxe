import { UpdateProfileInput } from './users.schema';
export declare function getMe(userId: string): Promise<any>;
export declare function updateMe(userId: string, updates: UpdateProfileInput): Promise<any>;
export declare function getUserById(userId: string, restaurantId: string): Promise<any>;
export declare function checkEmail(email: string): Promise<{
    available: boolean;
}>;
//# sourceMappingURL=users.service.d.ts.map