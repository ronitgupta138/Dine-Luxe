export interface DeductItem {
    inventory_id?: string;
    inventory_item_id?: string;
    menu_item_id?: string;
    quantity: number;
}
export declare function getInventoryByBranch(branchId: string, page: number, limit: number): Promise<{
    data: {
        name: string;
        quantity: number;
        min_threshold: number;
        cost_per_unit: number | null;
        id: string;
        branch_id: string;
        ingredient_name: string;
        unit: string;
        current_quantity: number | string;
        reorder_threshold: number | string;
        last_updated?: string;
        updated_by?: string | null;
    }[];
    count: number | null;
}>;
export declare function createInventoryItem(payload: {
    branch_id: string;
    name: string;
    unit: string;
    quantity: number;
    min_threshold: number;
    cost_per_unit?: number;
}, userId: string): Promise<{
    name: string;
    quantity: number;
    min_threshold: number;
    cost_per_unit: number | null;
    id: string;
    branch_id: string;
    ingredient_name: string;
    unit: string;
    current_quantity: number | string;
    reorder_threshold: number | string;
    last_updated?: string;
    updated_by?: string | null;
}>;
export declare function updateInventoryItem(id: string, payload: {
    quantity?: number;
    min_threshold?: number;
    cost_per_unit?: number;
    current_quantity?: number;
    reorder_threshold?: number;
    unit?: string;
    notes?: string;
}, userId: string): Promise<{
    name: string;
    quantity: number;
    min_threshold: number;
    cost_per_unit: number | null;
    id: string;
    branch_id: string;
    ingredient_name: string;
    unit: string;
    current_quantity: number | string;
    reorder_threshold: number | string;
    last_updated?: string;
    updated_by?: string | null;
}>;
export declare function deduct(branchId: string | undefined, items: DeductItem[], userId?: string): Promise<{
    items: {
        name: string;
        quantity: number;
        min_threshold: number;
        cost_per_unit: number | null;
        id: string;
        branch_id: string;
        ingredient_name: string;
        unit: string;
        current_quantity: number | string;
        reorder_threshold: number | string;
        last_updated?: string;
        updated_by?: string | null;
    }[];
}>;
export declare function getAlerts(branchId: string): Promise<{
    name: string;
    quantity: number;
    min_threshold: number;
    cost_per_unit: number | null;
    id: string;
    branch_id: string;
    ingredient_name: string;
    unit: string;
    current_quantity: number | string;
    reorder_threshold: number | string;
    last_updated?: string;
    updated_by?: string | null;
}[]>;
export declare function logWaste(inventoryItemId: string, quantity: number, reason: string, userId: string): Promise<any>;
//# sourceMappingURL=inventory.service.d.ts.map