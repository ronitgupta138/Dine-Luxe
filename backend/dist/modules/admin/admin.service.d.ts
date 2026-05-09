export declare function getDashboard(): Promise<any>;
export declare function getPlatformStats(): Promise<any>;
export declare function getHealth(): Promise<{
    status: string;
    db_latency_ms: number;
    redis_latency_ms: number;
    timestamp: string;
}>;
export declare function getDetailedHealth(): Promise<{
    redis_hit_rate_percent: number;
    db_metrics: any;
    status: string;
    db_latency_ms: number;
    redis_latency_ms: number;
    timestamp: string;
}>;
export declare function getRestaurants(page: number, limit: number, status?: string): Promise<{
    data: any[];
    count: number | null;
}>;
export declare function updateRestaurantStatus(id: string, status: string): Promise<any>;
export declare function getCustomers(page: number, limit: number, status?: string): Promise<{
    data: {
        id: any;
        name: any;
        email: any;
        phone: any;
        is_active: any;
        created_at: any;
    }[];
    count: number | null;
}>;
export declare function updateCustomerStatus(id: string, status: string): Promise<any>;
export declare function getFeedback(page: number, limit: number): Promise<{
    data: any[];
    count: number | null;
}>;
export declare function createAdmin(input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
}): Promise<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: "super_admin";
}>;
export declare function createSuperAdmin(input: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    phone?: string;
}): Promise<{
    id: string;
    email: string;
    name: string;
    phone: string | null;
    role: "super_admin";
}>;
//# sourceMappingURL=admin.service.d.ts.map