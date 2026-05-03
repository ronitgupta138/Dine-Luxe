export declare function assignDelivery(orderId: string, branchId: string, restaurantId: string): Promise<any>;
export declare function getDelivery(deliveryId: string, partnerId: string): Promise<any>;
export declare function updateDeliveryStatus(deliveryId: string, partnerId: string, newStatus: string): Promise<any>;
export declare function updatePartnerLocation(partnerId: string, lat: number, lon: number, deliveryId?: string): Promise<{
    throttled: boolean;
    retry_after_seconds: number;
    updated?: undefined;
    lat?: undefined;
    lon?: undefined;
} | {
    updated: boolean;
    lat: number;
    lon: number;
    throttled?: undefined;
    retry_after_seconds?: undefined;
}>;
export declare function getActiveDelivery(partnerId: string): Promise<any>;
export declare function getPartnerEarnings(partnerId: string): Promise<{
    deliveries: {
        id: any;
        delivered_at: any;
        earning: any;
    }[];
    total_earnings: number;
}>;
//# sourceMappingURL=delivery.service.d.ts.map