export declare function getSales(params: {
    branch_id?: string;
    restaurant_id: string;
    from: string;
    to: string;
    granularity: 'hourly' | 'daily' | 'weekly' | 'monthly';
}): Promise<any>;
export declare function getMenuPerformance(restaurantId: string, branchId?: string): Promise<any>;
export declare function getKitchenPerformance(branchId: string, from: string, to: string): Promise<any>;
export declare function getCustomerInsights(restaurantId: string): Promise<{
    new_customers_30d: number;
    returning_customers: any;
    top_spenders: any;
}>;
export declare function getAdminPlatformReport(): Promise<any>;
export declare function getAdminTrends(from: string, to: string): Promise<any>;
export declare function exportReport(params: {
    report_type: string;
    branch_id?: string;
    restaurant_id: string;
    from: string;
    to: string;
    format: 'csv' | 'pdf';
    requested_by: string;
}): Promise<{
    download_url: string;
    expires_in: number;
    expires_at: string;
}>;
//# sourceMappingURL=reports.service.d.ts.map