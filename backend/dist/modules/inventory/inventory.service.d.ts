export interface DeductItem {
    menu_item_id: string;
    quantity: number;
}
export declare function getInventoryByBranch(branchId: string, page: number, limit: number): Promise<{
    data: {
        id: any;
        branch_id: any;
        ingredient_name: any;
        unit: any;
        current_quantity: any;
        reorder_threshold: any;
        cost_per_unit: any;
        last_updated: any;
    }[];
    count: number | null;
}>;
export declare function updateInventoryItem(id: string, payload: {
    current_quantity?: number;
    reorder_threshold?: number;
    unit?: string;
}, userId: string): Promise<any>;
export declare function deduct(branchId: string, items: DeductItem[]): Promise<void>;
export declare function getAlerts(branchId: string): Promise<any[]>;
export declare function logWaste(inventoryItemId: string, quantity: number, reason: string, userId: string, branchId: string): Promise<any>;
//# sourceMappingURL=inventory.service.d.ts.map