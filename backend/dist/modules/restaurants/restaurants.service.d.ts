import { RegisterInput, UpdateRestaurantInput, UpdateStatusInput } from './restaurants.schema';
export declare function register(input: RegisterInput, ipAddress: string): Promise<{
    restaurant: any;
    branch: any;
}>;
export declare function getAll(page?: number, limit?: number, status?: string): Promise<{
    restaurants: {
        id: any;
        name: any;
        cuisine_type: any;
        status: any;
        gst_number: any;
        created_at: any;
    }[];
    total: number | null;
    page: number;
    limit: number;
}>;
export declare function getNearby(lat: number, lon: number, radiusKm?: number): Promise<any[]>;
export declare function getById(restaurantId: string): Promise<{
    restaurant_branding: {
        primary_color: any;
        secondary_color: any;
        logo_url: any;
        banner_url: any;
        app_name_display: any;
        tagline: any;
    } | null;
    branches: {
        id: any;
        name: any;
        address: any;
        lat: any;
        lon: any;
        is_active: any;
        operating_hours: any;
    }[];
    id: any;
    name: any;
    cuisine_type: any;
    gst_number: any;
    status: any;
    created_at: any;
    updated_at: any;
}>;
export declare function getLiveStatus(restaurantId: string, branchId?: string): Promise<{
    available_tables: number;
    total_tables: number;
    queue_length: number;
    avg_wait_minutes: number;
    is_accepting_orders: boolean;
}>;
export declare function update(restaurantId: string, input: UpdateRestaurantInput): Promise<any>;
export declare function updateStatus(restaurantId: string, input: UpdateStatusInput, actorId: string, ipAddress: string): Promise<any>;
//# sourceMappingURL=restaurants.service.d.ts.map