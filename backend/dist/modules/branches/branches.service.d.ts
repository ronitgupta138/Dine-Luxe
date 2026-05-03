import { CreateBranchInput, UpdateBranchInput, UpdateBranchStatusInput } from './branches.schema';
export declare function getAll(restaurantId: string): Promise<{
    id: any;
    name: any;
    address: any;
    lat: any;
    lon: any;
    is_active: any;
    operating_hours: any;
    created_at: any;
    updated_at: any;
    manager: {
        id: any;
        name: any;
    }[];
}[]>;
export declare function create(restaurantId: string, input: CreateBranchInput, actorId: string, ipAddress: string): Promise<any>;
export declare function getById(branchId: string, restaurantId: string): Promise<any>;
export declare function update(branchId: string, restaurantId: string, input: UpdateBranchInput): Promise<any>;
export declare function toggleStatus(branchId: string, restaurantId: string, input: UpdateBranchStatusInput, actorId: string, ipAddress: string): Promise<any>;
export declare function getLiveStats(branchId: string, restaurantId: string): Promise<{
    tables: Record<string, number>;
    total_tables: number;
    active_orders: number;
    staff_on_duty: number;
    revenue_today: number;
}>;
//# sourceMappingURL=branches.service.d.ts.map