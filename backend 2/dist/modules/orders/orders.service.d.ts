import type { CreateOrderInput } from './orders.schema';
export declare function createOrder(input: CreateOrderInput, restaurantId: string, branchId: string, createdBy: string): Promise<any>;
export declare function getOrderById(orderId: string, branchId: string): Promise<any>;
export declare function getOrdersByTable(tableId: string, branchId: string): Promise<any[]>;
export declare function getActiveBranchOrders(branchId: string): Promise<any[]>;
export declare function cancelOrder(orderId: string, branchId: string, reason?: string): Promise<any>;
//# sourceMappingURL=orders.service.d.ts.map