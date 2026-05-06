export declare function getMenuSuggestions(branchId: string): Promise<any>;
export declare function getBundleOpportunities(branchId: string): Promise<any>;
export declare function getDemandForecast(branchId: string): Promise<{
    date: string;
    day: string;
    predicted_orders: number;
    confidence: string;
}[]>;
export declare function getStaffingRecommendation(branchId: string): Promise<{
    date: string;
    day: string;
    predicted_orders: number;
    confidence: string;
    recommended_waiters: number;
    recommended_chefs: number;
    scheduled_waiters: number;
    scheduled_chefs: number;
    waiter_gap: number;
    chef_gap: number;
}[]>;
//# sourceMappingURL=analytics.service.d.ts.map