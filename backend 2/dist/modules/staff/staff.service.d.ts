import { CreateStaffInput, UpdateStaffInput } from './staff.schema';
export declare function getByBranch(branchId: string, restaurantId: string): Promise<{
    id: any;
    name: any;
    email: any;
    phone: any;
    role: any;
    employee_id: any;
    is_active: any;
    profile_pic_url: any;
    created_at: any;
    branches: {
        name: any;
    }[];
}[]>;
export declare function create(input: CreateStaffInput, restaurantId: string, actorId: string, actorBranchId: string, actorRole: string, ipAddress: string): Promise<any>;
export declare function getById(staffId: string, restaurantId: string): Promise<{
    id: any;
    name: any;
    email: any;
    phone: any;
    dob: any;
    gender: any;
    role: any;
    employee_id: any;
    is_active: any;
    profile_pic_url: any;
    force_password_change: any;
    created_at: any;
    branches: {
        id: any;
        name: any;
    }[];
}>;
export declare function update(staffId: string, restaurantId: string, input: UpdateStaffInput): Promise<any>;
export declare function toggleAccess(staffId: string, restaurantId: string, actorId: string, ipAddress: string): Promise<any>;
export declare function getPerformance(staffId: string, restaurantId: string): Promise<{
    orders_today: number;
    avg_branch_rating_this_week: number | null;
    rating_count: number;
    tables_served_this_week: number;
}>;
//# sourceMappingURL=staff.service.d.ts.map