import type { CreateCategoryInput, UpdateCategoryInput, CreateItemInput, UpdateItemInput, BulkUpdateInput } from './menu.schema';
export declare function getPublicMenu(branchId: string): Promise<any>;
export declare function getBranchCategories(branchId: string): Promise<any[]>;
export declare function createCategory(branchId: string, restaurantId: string, input: CreateCategoryInput): Promise<any>;
export declare function updateCategory(categoryId: string, branchId: string, input: UpdateCategoryInput): Promise<any>;
export declare function deleteCategory(categoryId: string, branchId: string): Promise<{
    deleted: boolean;
}>;
export declare function reorderCategories(branchId: string, orderedIds: string[]): Promise<{
    reordered: number;
}>;
export declare function createMenuItem(branchId: string, restaurantId: string, input: CreateItemInput): Promise<any>;
export declare function getMenuItemById(itemId: string): Promise<any>;
export declare function updateMenuItem(itemId: string, branchId: string, input: UpdateItemInput): Promise<any>;
export declare function deleteMenuItem(itemId: string, branchId: string): Promise<{
    deleted: boolean;
}>;
export declare function updateMenuItemStatus(itemId: string, branchId: string, status: 'available' | 'sold_out' | 'hidden'): Promise<any>;
export declare function bulkPriceUpdate(branchId: string, input: BulkUpdateInput): Promise<{
    updated: number;
}>;
//# sourceMappingURL=menu.service.d.ts.map