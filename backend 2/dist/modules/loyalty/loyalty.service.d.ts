export declare function getBalance(userId: string): Promise<{
    user_id: string;
    balance: number;
    total_earned: number;
    accounts: any[];
}>;
export declare function earn(userId: string, orderId: string, amountPaid: number, restaurantId: string): Promise<{
    points_earned: number;
    new_balance: number;
}>;
export declare function redeem(userId: string, orderId: string, pointsToRedeem: number, restaurantId: string): Promise<{
    discount_amount: number;
    new_balance: number;
}>;
export declare function getHistory(userId: string, page: number, limit: number): Promise<{
    data: any[];
    count: number;
}>;
//# sourceMappingURL=loyalty.service.d.ts.map