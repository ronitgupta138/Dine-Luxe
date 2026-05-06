export declare function getOrderItems(orderId: string, branchId: string): Promise<any[]>;
export declare function serveItem(itemId: string, branchId: string): Promise<any>;
export declare function updateItemStatus(itemId: string, branchId: string, status: 'pending' | 'preparing' | 'ready' | 'served' | 'cancelled'): Promise<any>;
//# sourceMappingURL=order-items.service.d.ts.map