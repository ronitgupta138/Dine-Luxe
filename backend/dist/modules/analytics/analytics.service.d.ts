export declare function getMenuSuggestions(branchId: string): Promise<any>;
export declare function getBundleOpportunities(branchId: string): Promise<any>;
export declare function getDemandForecast(branchId: string): Promise<any[]>;
export declare function getStaffingRecommendation(branchId: string): Promise<{
    date: any;
    day: any;
    predicted_orders: any;
    confidence: any;
    recommended_waiters: number;
    recommended_chefs: number;
    scheduled_waiters: number;
    scheduled_chefs: number;
    waiter_gap: number;
    chef_gap: number;
}[]>;
//# sourceMappingURL=analytics.service.d.ts.map