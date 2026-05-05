export declare function getKitchenTickets(branchId: string): Promise<{
    elapsed_minutes: number;
    id: any;
    status: any;
    created_at: any;
    table_id: any;
    tables: {
        label: any;
        floor_number: any;
    }[];
    order_items: {
        id: any;
        quantity: any;
        status: any;
        notes: any;
        menu_items: {
            name: any;
            prep_time_minutes: any;
            photo_url: any;
        }[];
    }[];
}[]>;
export declare function updateKitchenStatus(orderId: string, newStatus: string): Promise<any>;
export declare function getOverdueOrders(branchId: string): Promise<{
    elapsed_minutes: number;
    id: any;
    status: any;
    created_at: any;
    table_id: any;
    tables: {
        label: any;
    }[];
    order_items: {
        id: any;
        quantity: any;
        menu_items: {
            name: any;
            prep_time_minutes: any;
        }[];
    }[];
}[]>;
//# sourceMappingURL=kitchen.service.d.ts.map